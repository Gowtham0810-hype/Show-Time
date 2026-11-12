import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Movie } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Section3DCardRowProps {
  sectionId: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  sectionNumber: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onHoverMovie: (movie: Movie | null) => void;
  hoveredMovieId?: string | null;
}

const _vec2 = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

export const Section3DCardRow = React.memo<Section3DCardRowProps>(({
  sectionId,
  sectionTitle,
  sectionSubtitle,
  sectionNumber,
  movies,
  onSelectMovie,
  onHoverMovie,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipTitleRef = useRef<HTMLSpanElement>(null);
  const tooltipRatingRef = useRef<HTMLSpanElement>(null);
  const tooltipLangRef = useRef<HTMLSpanElement>(null);

  // WebGL scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);

  // Card items reference
  const cardsRef = useRef<Array<{
    rootGroup: THREE.Group;
    visualMesh: THREE.Mesh;
    hitProxy: THREE.Mesh;
    movie: Movie;
    basePosX: number;
    index: number;
    shaderMat: THREE.ShaderMaterial;
  }>>([]);

  // Horizontal momentum scroll / drag tracking
  const scrollOffsetRef = useRef(0);
  const targetScrollOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, offset: 0 });
  const activeHoveredIndexRef = useRef<number | null>(null);
  const currentHoveredMovieIdRef = useRef<string | null>(null);

  // Normal 3:4 Aspect Ratio (matching aspect-3/4 from MoviesPage):
  const CARD_WIDTH = 1.86;
  const CARD_HEIGHT = 2.48; // 1.86 / 2.48 = 0.75 = 3/4
  const CARD_DEPTH = 0.03;
  const SPACING_X = 2.22; // Proportional spacing for 3:4 cards
  const WAVE_FREQ = 0.52; // Smooth sine wave frequency
  const WAVE_AMP_Y = 0.32; // Undulation amplitude
  const WAVE_AMP_Z = 0.85; // Depth wave

  // Seamless card display: when there are 10+ movies (like ALL SHOWS with 15),
  // each movie appears exactly once (no partial repeats or duplicate neighbors!).
  // For smaller categories (< 10), repeat FULL sets so movies never duplicate side-by-side.
  const displayMovies = React.useMemo(() => {
    if (!movies || movies.length === 0) return [];
    if (movies.length >= 10) {
      return movies;
    }
    const targetCount = 14;
    const repeatCount = Math.ceil(targetCount / movies.length);
    const looped: Movie[] = [];
    for (let r = 0; r < repeatCount; r++) {
      looped.push(...movies);
    }
    return looped;
  }, [movies]);

  // Stable key so useEffect only runs when movie IDs actually change
  const movieIdsKey = React.useMemo(() => {
    return movies.map((m) => m.id).join(',');
  }, [movies]);

  // Create card texture: Exact 3:4 ratio (600x800) with aspect-ratio-preserving poster,
  // top badges, and crisp cinematic typography matching MoviesPage
  const createCardTextures = (movie: Movie): Promise<{ sharp: THREE.Texture; blur: THREE.Texture }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = movie.posterUrl;

      const drawCanvas = (loadedImg: HTMLImageElement | null) => {
        const sharpCanvas = document.createElement('canvas');
        sharpCanvas.width = 600;
        sharpCanvas.height = 800; // 3:4 aspect ratio (0.75)
        const ctx = sharpCanvas.getContext('2d');
        if (ctx) {
          // Dark canvas background
          ctx.fillStyle = '#141416';
          ctx.fillRect(0, 0, 600, 800);

          // Top to bottom: Draw poster using object-cover (preserving exact native aspect ratio)
          if (loadedImg && loadedImg.naturalWidth > 0 && loadedImg.naturalHeight > 0) {
            const imgRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
            const targetRatio = 600 / 800;
            let sx = 0, sy = 0, sw = loadedImg.naturalWidth, sh = loadedImg.naturalHeight;

            if (imgRatio > targetRatio) {
              sw = loadedImg.naturalHeight * targetRatio;
              sx = (loadedImg.naturalWidth - sw) / 2;
            } else {
              sh = loadedImg.naturalWidth / targetRatio;
              sy = (loadedImg.naturalHeight - sh) / 2;
            }
            ctx.drawImage(loadedImg, sx, sy, sw, sh, 0, 0, 600, 800);
          } else {
            ctx.fillStyle = '#1f1f23';
            ctx.fillRect(0, 0, 600, 800);
          }

          // Top-left Language Badge (identically styled to MoviesPage)
          ctx.fillStyle = 'rgba(250, 250, 250, 0.94)';
          ctx.fillRect(22, 22, 110, 32);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.lineWidth = 1;
          ctx.strokeRect(22, 22, 110, 32);

          ctx.fillStyle = '#141414';
          ctx.font = '600 13px ui-monospace, SFMono-Regular, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(movie.language.toUpperCase(), 77, 43);

          // Top-right Status Pill (NOW SHOWING / COMING SOON)
          const isShowing = movie.isNowShowing;
          ctx.fillStyle = 'rgba(20, 20, 20, 0.90)';
          ctx.fillRect(440, 22, 138, 32);
          ctx.strokeStyle = isShowing ? 'rgba(52, 211, 153, 0.45)' : 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1;
          ctx.strokeRect(440, 22, 138, 32);

          ctx.fillStyle = isShowing ? '#34d399' : '#fbbf24';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(isShowing ? 'NOW SHOWING' : 'COMING SOON', 509, 42);

          // Bottom Cinematic Gradient Overlay for pristine text readability
          const grad = ctx.createLinearGradient(0, 480, 0, 800);
          grad.addColorStop(0, 'rgba(12, 12, 15, 0)');
          grad.addColorStop(0.35, 'rgba(12, 12, 15, 0.68)');
          grad.addColorStop(1, 'rgba(12, 12, 15, 0.96)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 480, 600, 320);

          // Title (Uppercase bold Inter)
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Inter, sans-serif';
          let displayTitle = movie.title.toUpperCase();
          if (displayTitle.length > 22) {
            displayTitle = displayTitle.substring(0, 21) + '...';
          }
          ctx.fillText(displayTitle, 26, 680);

          // Genre strip
          ctx.fillStyle = '#d4d4d8';
          ctx.font = '500 16px Inter, sans-serif';
          const genreText = movie.genres.slice(0, 3).join(' / ');
          ctx.fillText(genreText, 26, 715);

          // Bottom Meta Row: Amber Star + Rating + Divider + Specs
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillText('★', 26, 755);

          ctx.fillStyle = '#ffffff';
          ctx.font = '600 18px Inter, sans-serif';
          ctx.fillText(`${movie.rating ?? '8.5'}`, 50, 755);

          ctx.fillStyle = '#71717a';
          ctx.font = '16px Inter, sans-serif';
          ctx.fillText('/ 10', 92, 755);

          // Certification & Runtime (Right aligned)
          ctx.textAlign = 'right';
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '500 15px ui-monospace, SFMono-Regular, monospace';
          ctx.fillText(`${movie.certification} • ${movie.runtimeMinutes}M`, 574, 755);

          // Subtle outer border on front face
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, 598, 798);
        }

        const sharpTex = new THREE.CanvasTexture(sharpCanvas);
        sharpTex.colorSpace = THREE.SRGBColorSpace;
        sharpTex.minFilter = THREE.LinearFilter;
        sharpTex.generateMipmaps = true;

        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = 36;
        blurCanvas.height = 48; // 36 / 48 = 0.75 (3:4)
        const ctxBlur = blurCanvas.getContext('2d');
        if (ctxBlur) {
          ctxBlur.drawImage(sharpCanvas, 0, 0, 36, 48);
        }
        const blurTex = new THREE.CanvasTexture(blurCanvas);
        blurTex.colorSpace = THREE.SRGBColorSpace;
        blurTex.minFilter = THREE.LinearFilter;
        blurTex.magFilter = THREE.LinearFilter;

        resolve({ sharp: sharpTex, blur: blurTex });
      };

      img.onload = () => drawCanvas(img);
      img.onerror = () => drawCanvas(null);
    });
  };

  // Initialize WebGL Scene
  useEffect(() => {
    if (!mountRef.current || displayMovies.length === 0) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fafafa');
    sceneRef.current = scene;

    // Camera calibrated for 20% card scale
    const camera = new THREE.PerspectiveCamera(5, width / height, 0.1, 1000);
    camera.position.set(0, 0, 48);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 0.85);
    dirLight.position.set(10, 20, 25);
    scene.add(dirLight);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    const cardEdgeMat = new THREE.MeshBasicMaterial({ color: 0xe0e0e0 });

    // Invisible hit proxy: visible=true, but transparent with opacity 0 so Three.js Raycaster hits it solidly
    const hitGeo = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    });

    let isDisposed = false;

    async function buildSineWaveRow() {
      const count = displayMovies.length;
      cardsRef.current = [];

      for (let i = 0; i < count; i++) {
        if (isDisposed) return;
        const movie = displayMovies[i];
        const textures = await createCardTextures(movie);

        const customShaderMat = new THREE.ShaderMaterial({
          uniforms: {
            uTextureSharp: { value: textures.sharp },
            uTextureBlur: { value: textures.blur },
            uOpacity: { value: 1.0 },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTextureSharp;
            uniform float uOpacity;
            varying vec2 vUv;
            void main() {
              vec4 sharpCol = texture2D(uTextureSharp, vUv);
              gl_FragColor = vec4(sharpCol.rgb, sharpCol.a * uOpacity);
            }
          `,
          transparent: true,
        });

        const materials = [
          cardEdgeMat,
          cardEdgeMat,
          cardEdgeMat,
          cardEdgeMat,
          customShaderMat,
          cardEdgeMat,
        ];

        // Root container for this card
        const rootGroup = new THREE.Group();

        // Visual Mesh (lifts and scales on hover)
        const visualMesh = new THREE.Mesh(cardGeo, materials);
        rootGroup.add(visualMesh);

        // Invisible Hit Proxy (stationary in rootGroup, handles raycasts with zero flutter)
        const hitProxy = new THREE.Mesh(hitGeo, hitMat);
        hitProxy.userData = { movie, index: i };
        rootGroup.add(hitProxy);

        const centerIndex = (count - 1) / 2;
        const rel = i - centerIndex;
        const basePosX = rel * SPACING_X;

        cardGroup.add(rootGroup);

        cardsRef.current.push({
          rootGroup,
          visualMesh,
          hitProxy,
          movie,
          basePosX,
          index: i,
          shaderMat: customShaderMat,
        });
      }
    }

    buildSineWaveRow();

    // Render loop with Sine-Wave positioning
    let animId = 0;
    const tick = () => {
      scrollOffsetRef.current += (targetScrollOffsetRef.current - scrollOffsetRef.current) * 0.08;

      const total = cardsRef.current.length;
      if (total > 0) {
        const span = total * SPACING_X;
        const halfSpan = span / 2;

        cardsRef.current.forEach((item) => {
          let x = item.basePosX + scrollOffsetRef.current * SPACING_X;
          while (x < -halfSpan) x += span;
          while (x > halfSpan) x -= span;

          const wavePhase = x * WAVE_FREQ;
          const y = Math.sin(wavePhase) * WAVE_AMP_Y;
          const z = Math.cos(wavePhase) * WAVE_AMP_Z;
          const rotY = -Math.sin(wavePhase) * 0.28; // ~16° dynamic tilt
          const rotZ = Math.cos(wavePhase) * 0.03;

          item.rootGroup.position.set(x, y, z);
          item.rootGroup.rotation.set(0, rotY, rotZ);
        });
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      cardGeo.dispose();
      cardEdgeMat.dispose();
      hitGeo.dispose();
      hitMat.dispose();
      cardsRef.current.forEach((c) => c.shaderMat.dispose());
    };
  }, [movieIdsKey, displayMovies]);

  // Glitch-Free, Zero-ReRender Raycasting
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Direct DOM tooltip update: NO React state updates or component re-renders!
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate3d(${clientX + 16}px, ${clientY + 12}px, 0)`;
    }

    if (isDraggingRef.current) {
      const deltaX = clientX - dragStartRef.current.x;
      targetScrollOffsetRef.current = dragStartRef.current.offset + deltaX * 0.005;
      return;
    }

    _vec2.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _vec2.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_vec2, cameraRef.current);
    const proxies = cardsRef.current.map((c) => c.hitProxy);
    const intersects = _raycaster.intersectObjects(proxies);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const hitIndex = hit.userData.index as number;
      const hitMovie = hit.userData.movie as Movie;

      if (activeHoveredIndexRef.current !== hitIndex) {
        // Return previous card visual mesh
        if (activeHoveredIndexRef.current !== null) {
          const prev = cardsRef.current[activeHoveredIndexRef.current];
          if (prev) {
            gsap.to(prev.visualMesh.position, { z: 0, duration: 0.25, ease: 'expo.out' });
            gsap.to(prev.visualMesh.scale, { x: 1, y: 1, duration: 0.25, ease: 'expo.out' });
          }
        }

        activeHoveredIndexRef.current = hitIndex;

        // Lift current card visual mesh smoothly
        const current = cardsRef.current[hitIndex];
        if (current) {
          gsap.to(current.visualMesh.position, { z: 0.38, duration: 0.3, ease: 'expo.out' });
          gsap.to(current.visualMesh.scale, { x: 1.04, y: 1.04, duration: 0.3, ease: 'expo.out' });
        }

        // Update tooltip content directly via DOM
        if (tooltipRef.current && tooltipTitleRef.current && tooltipRatingRef.current && tooltipLangRef.current) {
          tooltipTitleRef.current.textContent = hitMovie.title;
          tooltipRatingRef.current.textContent = `★ ${hitMovie.rating ?? '8.8'}`;
          tooltipLangRef.current.textContent = `• ${hitMovie.language}`;
          tooltipRef.current.style.opacity = '1';
        }

        // Only notify parent when hovered movie ID actually changes
        if (currentHoveredMovieIdRef.current !== hitMovie.id) {
          currentHoveredMovieIdRef.current = hitMovie.id;
          onHoverMovie(hitMovie);
        }
      }
    } else {
      if (activeHoveredIndexRef.current !== null) {
        const prev = cardsRef.current[activeHoveredIndexRef.current];
        if (prev) {
          gsap.to(prev.visualMesh.position, { z: 0, duration: 0.25, ease: 'expo.out' });
          gsap.to(prev.visualMesh.scale, { x: 1, y: 1, duration: 0.25, ease: 'expo.out' });
        }
        activeHoveredIndexRef.current = null;
        currentHoveredMovieIdRef.current = null;

        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }

        onHoverMovie(null);
      }
    }
  }, [onHoverMovie]);

  const handlePointerLeave = () => {
    if (activeHoveredIndexRef.current !== null) {
      const prev = cardsRef.current[activeHoveredIndexRef.current];
      if (prev) {
        gsap.to(prev.visualMesh.position, { z: 0, duration: 0.25, ease: 'expo.out' });
        gsap.to(prev.visualMesh.scale, { x: 1, y: 1, duration: 0.25, ease: 'expo.out' });
      }
      activeHoveredIndexRef.current = null;
      currentHoveredMovieIdRef.current = null;

      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }

      onHoverMovie(null);
    }
    isDraggingRef.current = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offset: targetScrollOffsetRef.current,
    };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel handling:
  // If user scrolls horizontally or with shift, scroll row horizontally!
  // If user scrolls vertically, let native scroll move through sections!
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      const delta = e.shiftKey ? e.deltaY : e.deltaX;
      targetScrollOffsetRef.current -= delta * 0.003;
    }
  };

  const handleClick = () => {
    if (activeHoveredIndexRef.current !== null) {
      const selectedItem = cardsRef.current[activeHoveredIndexRef.current];
      if (selectedItem) {
        onSelectMovie(selectedItem.movie);
      }
    }
  };

  const shiftLeft = () => {
    targetScrollOffsetRef.current += 1.6;
  };

  const shiftRight = () => {
    targetScrollOffsetRef.current -= 1.6;
  };

  return (
    <section
      id={sectionId}
      ref={containerRef}
      className="relative w-full py-12 md:py-16 border-b border-black/[0.08] select-none"
    >
      {/* Section Header - Aligned closer to the left, scaled +15% */}
      <div className="w-full px-6 sm:px-10 lg:px-14 mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="label-mono text-[12px] text-[#8e8e8e] font-semibold">{sectionNumber}</span>
            <span className="text-[#8e8e8e]">•</span>
            <span className="label-xs text-[12px] text-[#8e8e8e]">{movies.length} TITLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-normal tracking-tight uppercase leading-none text-[#141414]">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-xs sm:text-[14px] text-[#8e8e8e] mt-1.5 font-mono uppercase tracking-wide">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Section Navigation Controls (scaled +15%) */}
        <div className="flex items-center gap-3.5">
          <span className="hidden md:inline-block label-mono text-[11px] text-[#8e8e8e] uppercase tracking-wider">
            • SCROLL TO TRAVERSE SECTIONS
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={shiftLeft}
              className="w-10 h-10 flex items-center justify-center border border-black/10 hover:bg-black/5 hover:border-black transition-colors"
              aria-label="Previous cards"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={shiftRight}
              className="w-10 h-10 flex items-center justify-center border border-black/10 hover:bg-black/5 hover:border-black transition-colors"
              aria-label="Next cards"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Sine-Wave 3D Viewport (calibrated for 20% card scale) */}
      <div className="relative w-full h-[540px] sm:h-[600px] md:h-[640px] overflow-hidden bg-[#fafafa]">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onClick={handleClick}
        />

        {/* Fast DOM Tooltip (scaled +15%) */}
        <div
          ref={tooltipRef}
          className="fixed pointer-events-none z-50 px-4 py-2.5 bg-[#141414] text-white text-[13px] font-medium tracking-wider uppercase shadow-xl border border-white/10 flex items-center gap-2.5 opacity-0 transition-opacity duration-150 top-0 left-0"
          style={{ willChange: 'transform' }}
        >
          <span ref={tooltipTitleRef} className="font-semibold" />
          <span ref={tooltipRatingRef} className="text-amber-400 font-bold" />
          <span ref={tooltipLangRef} className="text-white/60 text-[11px]" />
        </div>
      </div>
    </section>
  );
});
