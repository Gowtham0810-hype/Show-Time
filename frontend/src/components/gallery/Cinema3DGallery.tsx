import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Movie } from '../../types';

interface Cinema3DGalleryProps {
  movies: Movie[];
  activeFilter: string;
  theme?: 'light' | 'dark';
  onSelectMovie: (movie: Movie) => void;
  onHoverMovie?: (movie: Movie | null) => void;
  hoveredMovieId?: string | null;
  isDetailsOpen?: boolean;
}

// Reusable math helpers outside tick loop to prevent GC pressure
const _vec2 = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

export const Cinema3DGallery: React.FC<Cinema3DGalleryProps> = ({
  movies,
  activeFilter,
  theme = 'light',
  onSelectMovie,
  onHoverMovie,
  hoveredMovieId,
  isDetailsOpen = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLDivElement>(null);

  // Loading state
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  // WebGL scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const cardsRef = useRef<Array<{
    mesh: THREE.Mesh;
    movie: Movie;
    basePos: THREE.Vector3;
    baseRot: THREE.Euler;
    index: number;
    shaderMat: THREE.ShaderMaterial;
    hoverLift: { val: number };
  }>>([]);

  // Gallery momentum scroll / drag tracking
  const scrollOffsetRef = useRef(0);
  const targetScrollOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, offset: 0 });
  const activeHoveredIndexRef = useRef<number | null>(null);
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);
  const initialFlyInCompleteRef = useRef(false);

  // Redesigned proportions & angles based on user feedback:
  // - Angle reduced from 45° to ~25 degrees (-0.4363 rad)
  // - Spacing significantly tighter (from 1.65 down to 1.05) so posters feel close and cohesive
  const CARD_WIDTH = 1.08;
  const CARD_HEIGHT = 1.64;
  const CARD_DEPTH = 0.02;
  const ROTATION_Y = -0.4363; // ~25 degrees
  const SPACING_X = 1.08; // Much closer spacing!
  const SPACING_Y = 0.42;
  const SPACING_Z = 0.68;

  // Create dual sharp + blur textures with MOVIE TITLE & RATING rendered right under poster
  const createCardTextures = (movie: Movie, isDarkTheme: boolean): Promise<{ sharp: THREE.Texture; blur: THREE.Texture }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = movie.posterUrl;

      const drawCardCanvas = (loadedImg: HTMLImageElement | null) => {
        // 1. Sharp canvas 512x768
        const sharpCanvas = document.createElement('canvas');
        sharpCanvas.width = 512;
        sharpCanvas.height = 768;
        const ctxSharp = sharpCanvas.getContext('2d');
        if (ctxSharp) {
          // Card background
          ctxSharp.fillStyle = isDarkTheme ? '#141416' : '#ffffff';
          ctxSharp.fillRect(0, 0, 512, 768);

          // Top 80% (0 to 614px): Movie Poster
          if (loadedImg) {
            ctxSharp.drawImage(loadedImg, 0, 0, 512, 614);
          } else {
            ctxSharp.fillStyle = '#1e1e24';
            ctxSharp.fillRect(0, 0, 512, 614);
          }

          // Subtle divider line between poster and bottom label strip
          ctxSharp.strokeStyle = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
          ctxSharp.lineWidth = 2;
          ctxSharp.beginPath();
          ctxSharp.moveTo(0, 614);
          ctxSharp.lineTo(512, 614);
          ctxSharp.stroke();

          // Bottom 20% (614px to 768px): Minimal Editorial Title & Rating Strip
          ctxSharp.fillStyle = isDarkTheme ? '#141416' : '#ffffff';
          ctxSharp.fillRect(0, 615, 512, 153);

          // Movie Title in bold uppercase
          ctxSharp.fillStyle = isDarkTheme ? '#f4f4f5' : '#141414';
          ctxSharp.font = 'bold 26px Inter, sans-serif';
          ctxSharp.letterSpacing = '1px';
          
          let displayTitle = movie.title.toUpperCase();
          if (displayTitle.length > 22) {
            displayTitle = displayTitle.substring(0, 20) + '...';
          }
          ctxSharp.fillText(displayTitle, 24, 660);

          // Star icon & Rating (e.g. ★ 9.1)
          ctxSharp.fillStyle = '#d97706'; // Amber gold
          ctxSharp.font = 'bold 22px Inter, sans-serif';
          ctxSharp.fillText('★', 24, 706);

          ctxSharp.fillStyle = isDarkTheme ? '#e4e4e7' : '#27272a';
          ctxSharp.font = '600 20px Inter, sans-serif';
          ctxSharp.fillText(`${movie.rating ?? '8.8'} / 10`, 52, 706);

          // Language & Genre tag
          ctxSharp.fillStyle = isDarkTheme ? '#71717a' : '#8e8e8e';
          ctxSharp.font = '500 18px ui-monospace, SFMono-Regular, monospace';
          const subText = `${movie.language.toUpperCase()} • ${movie.certification}`;
          const subWidth = ctxSharp.measureText(subText).width;
          ctxSharp.fillText(subText, 512 - 24 - subWidth, 706);
        }

        const sharpTex = new THREE.CanvasTexture(sharpCanvas);
        sharpTex.colorSpace = THREE.SRGBColorSpace;
        sharpTex.minFilter = THREE.LinearFilter;
        sharpTex.generateMipmaps = true;

        // 2. Blur canvas 32x48 with linear filter for soft edge blending
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = 32;
        blurCanvas.height = 48;
        const ctxBlur = blurCanvas.getContext('2d');
        if (ctxBlur) {
          ctxBlur.drawImage(sharpCanvas, 0, 0, 32, 48);
        }
        const blurTex = new THREE.CanvasTexture(blurCanvas);
        blurTex.colorSpace = THREE.SRGBColorSpace;
        blurTex.minFilter = THREE.LinearFilter;
        blurTex.magFilter = THREE.LinearFilter;

        resolve({ sharp: sharpTex, blur: blurTex });
      };

      img.onload = () => drawCardCanvas(img);
      img.onerror = () => drawCardCanvas(null);
    });
  };

  // Initialize WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isDark = theme === 'dark';

    // Detect software WebGL
    const gl = document.createElement('canvas').getContext('webgl2');
    const isSoftwareGl = (() => {
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene with theme-aware background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? '#0c0c0e' : '#fafafa');
    sceneRef.current = scene;

    // PerspectiveCamera with 5-degree field of view
    const camera = new THREE.PerspectiveCamera(5, width / height, 0.1, 1000);
    camera.position.set(0, 0, 38);
    cameraRef.current = camera;

    // WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.15 : 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, isDark ? 0.9 : 0.8);
    dirLight.position.set(10, 20, 25);
    scene.add(dirLight);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    // Geometry shared across all cards
    const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    const edgeColor = isDark ? 0x222226 : 0xe0e0e0;
    const cardEdgeMat = new THREE.MeshBasicMaterial({ color: edgeColor });

    let isDisposed = false;

    // Build movie cards asynchronously with loading percentage
    async function loadCards() {
      if (movies.length === 0) return;
      const count = movies.length;
      let loadedCount = 0;
      cardsRef.current = [];

      for (let i = 0; i < count; i++) {
        if (isDisposed) return;
        const movie = movies[i];
        const textures = await createCardTextures(movie, isDark);

        // Custom soft-edge shader material
        const customShaderMat = new THREE.ShaderMaterial({
          uniforms: {
            uTextureSharp: { value: textures.sharp },
            uTextureBlur: { value: textures.blur },
            uOpacity: { value: 1.0 },
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
              vUv = uv;
              vNormal = normal;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTextureSharp;
            uniform sampler2D uTextureBlur;
            uniform float uOpacity;
            varying vec2 vUv;

            void main() {
              float distFromEdgeX = min(vUv.x, 1.0 - vUv.x);
              float distFromEdgeY = min(vUv.y, 1.0 - vUv.y);
              float dist = min(distFromEdgeX, distFromEdgeY);

              float sharpWeight = smoothstep(0.0, 0.12, dist);

              vec4 sharpCol = texture2D(uTextureSharp, vUv);
              vec4 blurCol = texture2D(uTextureBlur, vUv);

              vec4 blended = mix(blurCol, sharpCol, sharpWeight);
              gl_FragColor = vec4(blended.rgb, blended.a * uOpacity);
            }
          `,
          transparent: true,
        });

        // Mesh with multi-materials
        const materials = [
          cardEdgeMat, // right
          cardEdgeMat, // left
          cardEdgeMat, // top
          cardEdgeMat, // bottom
          customShaderMat, // front
          cardEdgeMat, // back
        ];

        const cardMesh = new THREE.Mesh(cardGeo, materials);
        cardMesh.userData = { movie, index: i };

        // Position along the diagonal lower-left to upper-right with reduced angle (25deg) and tight spacing
        const centerIndex = (count - 1) / 2;
        const rel = i - centerIndex;
        const posX = rel * SPACING_X;
        const posY = rel * SPACING_Y;
        const posZ = rel * SPACING_Z;

        cardMesh.position.set(posX, posY, posZ);
        cardMesh.rotation.set(0, ROTATION_Y, 0);

        // Start offscreen for initial fly-in
        cardMesh.position.y -= 10;
        cardMesh.position.z -= 8;

        cardGroup.add(cardMesh);

        cardsRef.current.push({
          mesh: cardMesh,
          movie,
          basePos: new THREE.Vector3(posX, posY, posZ),
          baseRot: new THREE.Euler(0, ROTATION_Y, 0),
          index: i,
          shaderMat: customShaderMat,
          hoverLift: { val: 0 },
        });

        loadedCount++;
        const pct = Math.round((loadedCount / count) * 100);
        setLoadProgress(pct);
      }

      setIsLoaded(true);

      // Intro fly-in transition
      cardsRef.current.forEach((item, idx) => {
        gsap.to(item.mesh.position, {
          x: item.basePos.x,
          y: item.basePos.y,
          z: item.basePos.z,
          duration: 1.8,
          delay: idx * 0.03,
          ease: 'expo.out',
          onComplete: () => {
            if (idx === cardsRef.current.length - 1) {
              initialFlyInCompleteRef.current = true;
            }
          },
        });
      });
    }

    loadCards();

    // Animation Loop
    let animId = 0;
    const tick = () => {
      // Smooth continuous scroll momentum interpolation
      scrollOffsetRef.current += (targetScrollOffsetRef.current - scrollOffsetRef.current) * 0.08;

      if (initialFlyInCompleteRef.current && !isDetailsOpen) {
        const total = cardsRef.current.length;
        if (total > 0) {
          const span = total * SPACING_X;
          const halfSpan = span / 2;

          cardsRef.current.forEach((item) => {
            if (item.mesh === selectedMeshRef.current) return;

            // Compute wrapped diagonal position
            let x = item.basePos.x + scrollOffsetRef.current * SPACING_X;
            while (x < -halfSpan) x += span;
            while (x > halfSpan) x -= span;

            const ratio = (x - item.basePos.x) / SPACING_X;
            const y = item.basePos.y + ratio * SPACING_Y;
            const z = item.basePos.z + ratio * SPACING_Z;

            // FIX: ALWAYS update position even when hovered, so card NEVER sticks to the screen while scrolling!
            item.mesh.position.x = x;
            item.mesh.position.y = y;
            item.mesh.position.z = z + item.hoverLift.val; // smoothly lifted outward
          });
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Resize Handler
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
      cardsRef.current.forEach((c) => {
        c.shaderMat.dispose();
      });
    };
  }, [movies, theme]);

  // Handle Raycasting on Pointer Move
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDetailsOpen) return;
    const container = mountRef.current;
    if (!container || !cameraRef.current) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    setCursorPos({ x: clientX, y: clientY });

    // Handle Dragging
    if (isDraggingRef.current) {
      const deltaX = clientX - dragStartRef.current.x;
      targetScrollOffsetRef.current = dragStartRef.current.offset + deltaX * 0.005;
      return;
    }

    _vec2.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _vec2.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_vec2, cameraRef.current);
    const meshes = cardsRef.current.map((c) => c.mesh);
    const intersects = _raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const hitIndex = hit.userData.index as number;
      const hitMovie = hit.userData.movie as Movie;

      if (activeHoveredIndexRef.current !== hitIndex) {
        // Return previous card
        if (activeHoveredIndexRef.current !== null) {
          const prev = cardsRef.current[activeHoveredIndexRef.current];
          if (prev && prev.mesh !== selectedMeshRef.current) {
            gsap.to(prev.hoverLift, {
              val: 0,
              duration: 0.4,
              ease: 'expo.out',
            });
            gsap.to(prev.mesh.rotation, {
              y: ROTATION_Y,
              duration: 0.4,
              ease: 'expo.out',
            });
          }
        }

        // Lift newly hovered card outward
        activeHoveredIndexRef.current = hitIndex;
        setHoveredMovie(hitMovie);
        onHoverMovie?.(hitMovie);

        const currentItem = cardsRef.current[hitIndex];
        if (currentItem) {
          gsap.to(currentItem.hoverLift, {
            val: 0.32,
            duration: 0.4,
            ease: 'expo.out',
          });
          gsap.to(currentItem.mesh.rotation, {
            y: ROTATION_Y * 0.7,
            duration: 0.4,
            ease: 'expo.out',
          });
        }
      }
    } else {
      if (activeHoveredIndexRef.current !== null) {
        const prev = cardsRef.current[activeHoveredIndexRef.current];
        if (prev && prev.mesh !== selectedMeshRef.current) {
          gsap.to(prev.hoverLift, {
            val: 0,
            duration: 0.4,
            ease: 'expo.out',
          });
          gsap.to(prev.mesh.rotation, {
            y: ROTATION_Y,
            duration: 0.4,
            ease: 'expo.out',
          });
        }
        activeHoveredIndexRef.current = null;
        setHoveredMovie(null);
        onHoverMovie?.(null);
      }
    }
  }, [isDetailsOpen, onHoverMovie]);

  // Pointer Down & Up for Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDetailsOpen) return;
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

  // Wheel Scroll Handling: does not stick hovered card
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (isDetailsOpen) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetScrollOffsetRef.current -= delta * 0.003;
  }, [isDetailsOpen]);

  // Keyboard Arrow Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDetailsOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetScrollOffsetRef.current -= 0.6;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetScrollOffsetRef.current += 0.6;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsOpen]);

  // Click Interaction: Fly-to-page transition
  const handleClick = () => {
    if (isDetailsOpen || !cameraRef.current) return;
    if (activeHoveredIndexRef.current !== null) {
      const selectedItem = cardsRef.current[activeHoveredIndexRef.current];
      if (!selectedItem) return;

      selectedMeshRef.current = selectedItem.mesh;

      // 1. Hide all other movie cards smoothly
      cardsRef.current.forEach((item) => {
        if (item.mesh !== selectedItem.mesh) {
          gsap.to(item.shaderMat.uniforms.uOpacity, {
            value: 0.0,
            duration: 0.6,
            ease: 'power2.inOut',
          });
          gsap.to(item.mesh.position, {
            y: item.mesh.position.y - 4,
            duration: 0.8,
            ease: 'power2.inOut',
          });
        }
      });

      // 2. Move selected card to centre & turn card from -25deg to face viewer (0deg)
      gsap.to(selectedItem.mesh.position, {
        x: 0,
        y: 0,
        z: 18,
        duration: 1.25,
        ease: 'expo.inOut',
      });

      gsap.to(selectedItem.mesh.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.25,
        ease: 'expo.inOut',
        onComplete: () => {
          onSelectMovie(selectedItem.movie);
        },
      });
    }
  };

  // Synchronize hover state if triggered by external index row hover
  useEffect(() => {
    if (!hoveredMovieId || isDetailsOpen) return;
    const targetIdx = cardsRef.current.findIndex((c) => c.movie.id === hoveredMovieId);
    if (targetIdx !== -1 && activeHoveredIndexRef.current !== targetIdx) {
      const targetItem = cardsRef.current[targetIdx];
      targetScrollOffsetRef.current = -targetItem.basePos.x / SPACING_X;

      gsap.to(targetItem.hoverLift, {
        val: 0.32,
        duration: 0.4,
        ease: 'expo.out',
      });
      gsap.to(targetItem.mesh.rotation, {
        y: ROTATION_Y * 0.7,
        duration: 0.4,
        ease: 'expo.out',
      });
      activeHoveredIndexRef.current = targetIdx;
      setHoveredMovie(targetItem.movie);
    }
  }, [hoveredMovieId, isDetailsOpen]);

  // Handle active filter changes: matching cards stay, non-matching sink slightly and fade
  useEffect(() => {
    if (!cardsRef.current.length) return;

    cardsRef.current.forEach((item) => {
      let isMatch = true;
      if (activeFilter === 'showing') {
        isMatch = item.movie.isNowShowing;
      } else if (activeFilter === 'upcoming') {
        isMatch = item.movie.isUpcoming;
      } else if (activeFilter !== 'all') {
        isMatch =
          item.movie.genres.some((g) => g.toLowerCase() === activeFilter.toLowerCase()) ||
          item.movie.language.toLowerCase() === activeFilter.toLowerCase();
      }

      if (isMatch) {
        gsap.to(item.shaderMat.uniforms.uOpacity, { value: 1.0, duration: 0.5 });
        gsap.to(item.mesh.position, { y: item.basePos.y, duration: 0.6, ease: 'expo.out' });
      } else {
        gsap.to(item.shaderMat.uniforms.uOpacity, { value: 0.12, duration: 0.5 });
        gsap.to(item.mesh.position, { y: item.basePos.y - 1.2, duration: 0.6, ease: 'expo.out' });
      }
    });
  }, [activeFilter]);

  // Restore gallery when details page is closed
  useEffect(() => {
    if (!isDetailsOpen && selectedMeshRef.current) {
      selectedMeshRef.current = null;
      activeHoveredIndexRef.current = null;

      cardsRef.current.forEach((item) => {
        gsap.to(item.shaderMat.uniforms.uOpacity, { value: 1.0, duration: 0.8 });
        gsap.to(item.mesh.position, {
          x: item.basePos.x,
          y: item.basePos.y,
          z: item.basePos.z,
          duration: 1.8,
          ease: 'expo.out',
        });
        gsap.to(item.mesh.rotation, {
          x: 0,
          y: ROTATION_Y,
          z: 0,
          duration: 1.8,
          ease: 'expo.out',
        });
      });
    }
  }, [isDetailsOpen]);

  // Theme change scene background update
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(theme === 'dark' ? '#0c0c0e' : '#fafafa');
    }
  }, [theme]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Intro Percentage Loader */}
      {!isLoaded && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-700 ${
            theme === 'dark' ? 'bg-[#0c0c0e] text-[#f4f4f5]' : 'bg-[#fafafa] text-[#141414]'
          }`}
        >
          <div className="label-xs text-[#8e8e8e] mb-4">CINEMA / GALLERY INITIALIZATION</div>
          <div className="text-6xl md:text-8xl font-light tracking-tighter tabular-nums">
            {loadProgress}%
          </div>
          <div className="w-32 h-[1px] bg-black/10 dark:bg-white/10 mt-6 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                theme === 'dark' ? 'bg-white' : 'bg-[#141414]'
              }`}
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Floating Hover Label beside cursor */}
      {hoveredMovie && !isDetailsOpen && (
        <div
          ref={cursorLabelRef}
          className="fixed pointer-events-none z-40 px-3 py-1.5 bg-[#141414] dark:bg-white text-white dark:text-[#141414] text-[11px] font-medium tracking-wider uppercase shadow-md transition-transform duration-75 ease-out border border-white/10 dark:border-black/10 flex items-center gap-2"
          style={{
            transform: `translate3d(${cursorPos.x + 18}px, ${cursorPos.y + 12}px, 0)`,
          }}
        >
          <span>{hoveredMovie.title}</span>
          <span className="text-amber-400 dark:text-amber-600 font-bold">★ {hoveredMovie.rating ?? '8.8'}</span>
          <span className="text-white/50 dark:text-black/50">• {hoveredMovie.language}</span>
        </div>
      )}
    </div>
  );
};
