import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Movie, Theatre, Showtime, User } from '../types';
import {
  Shield,
  Plus,
  Film,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Search,
  X,
  ExternalLink,
  Star,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AdminPageProps {
  user: User | null;
  onOpenAuthModal: () => void;
  onMovieAdded?: (movie: Movie) => void;
  onMovieDeleted?: (movieId: string) => void;
}

const COMMON_GENRES = [
  'Action',
  'Drama',
  'Horror',
  'Sci-Fi',
  'Thriller',
  'Crime',
  'Comedy',
  'Biography',
  'Music',
  'Adventure',
  'Mystery',
  'Western'
];

export const AdminPage: React.FC<AdminPageProps> = ({
  user,
  onOpenAuthModal,
  onMovieAdded,
  onMovieDeleted
}) => {
  const [activeSection, setActiveSection] = useState<'movies' | 'theatres' | 'showtimes'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [availablePosters, setAvailablePosters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchMovieQuery, setSearchMovieQuery] = useState('');

  // Poster Upload & Preview State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Movie Form State
  const [newMovie, setNewMovie] = useState<{
    title: string;
    originalTitle: string;
    language: string;
    genres: string;
    runtimeMinutes: number;
    releaseDate: string;
    certification: 'U' | 'UA' | 'A' | 'PG-13' | 'R';
    rating: number;
    synopsis: string;
    posterUrl: string;
    isNowShowing: boolean;
    isUpcoming: boolean;
    director: string;
    cast: string;
  }>({
    title: '',
    originalTitle: '',
    language: 'English',
    genres: 'Drama, Thriller',
    runtimeMinutes: 120,
    releaseDate: '2026-06-15',
    certification: 'UA',
    rating: 8.5,
    synopsis: '',
    posterUrl: '',
    isNowShowing: true,
    isUpcoming: false,
    director: '',
    cast: '',
  });

  // Theatre Form State
  const [newTheatre, setNewTheatre] = useState({
    name: '',
    location: '',
    city: 'Chennai',
    screenName: 'Screen 1 (Laser 4K)',
    screenType: 'Dolby Atmos 4K',
    capacity: 120,
  });

  // Showtime Form State
  const [newShowtime, setNewShowtime] = useState({
    movieId: '',
    theatreId: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    format: 'IMAX 3D',
    price: 350,
  });

  const [showtimeMovieFilter, setShowtimeMovieFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      const [m, t, s, posters] = await Promise.all([
        api.getMovies(),
        api.getTheatres(),
        api.getShowtimes(),
        api.getAvailablePosters().catch(() => []),
      ]);
      setMovies(m);
      setTheatres(t);
      setShowtimes(s);
      setAvailablePosters(posters);
      if (m.length > 0 && !newShowtime.movieId) setNewShowtime((prev) => ({ ...prev, movieId: String(m[0].id) }));
      if (t.length > 0 && !newShowtime.theatreId) setNewShowtime((prev) => ({ ...prev, theatreId: String(t[0].id) }));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update showtime default dropdowns if movies change
  useEffect(() => {
    if (movies.length > 0 && !newShowtime.movieId) {
      setNewShowtime((prev) => ({ ...prev, movieId: movies[0].id }));
    }
  }, [movies]);

  // Handle Local Poster File Selection
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, WebP).' });
      return;
    }

    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPosterPreview(dataUrl);
      setNewMovie((prev) => ({ ...prev, posterUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Poster Pick
  const handleSelectPresetPoster = (url: string) => {
    setPosterFile(null);
    setPosterPreview(url);
    setNewMovie((prev) => ({ ...prev, posterUrl: url }));
  };

  // Clear Poster
  const handleClearPoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    setNewMovie((prev) => ({ ...prev, posterUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Quick Genre Tag Toggle
  const toggleGenre = (genreName: string) => {
    const current = newMovie.genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    let updated: string[];
    if (current.some((g) => g.toLowerCase() === genreName.toLowerCase())) {
      updated = current.filter((g) => g.toLowerCase() !== genreName.toLowerCase());
    } else {
      updated = [...current, genreName];
    }
    setNewMovie((prev) => ({ ...prev, genres: updated.join(', ') }));
  };

  // Submit Movie Record
  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      let finalPosterUrl = newMovie.posterUrl.trim();

      // If user uploaded a new local file, upload it to the server to get a permanent file URL
      if (posterFile && posterPreview && posterPreview.startsWith('data:')) {
        try {
          const uploadRes = await api.uploadPoster(posterPreview, posterFile.name);
          finalPosterUrl = uploadRes.posterUrl;
        } catch (uploadErr: any) {
          console.warn('Poster server upload fallback to data URI:', uploadErr);
          // Keep data URL if upload failed
        }
      }

      if (!finalPosterUrl) {
        finalPosterUrl = '/posters/batman.jpg';
      }

      const moviePayload = {
        title: newMovie.title.trim().toUpperCase(),
        originalTitle: newMovie.originalTitle.trim() || newMovie.title.trim(),
        language: newMovie.language,
        genres: newMovie.genres.split(',').map((g) => g.trim()).filter(Boolean),
        runtimeMinutes: Number(newMovie.runtimeMinutes) || 120,
        releaseDate: newMovie.releaseDate || '2026-06-15',
        certification: newMovie.certification,
        rating: Number(newMovie.rating) || 8.5,
        synopsis: newMovie.synopsis.trim(),
        posterUrl: finalPosterUrl,
        director: newMovie.director.trim() || 'Director',
        cast: newMovie.cast.split(',').map((c) => c.trim()).filter(Boolean),
        isNowShowing: newMovie.isNowShowing,
        isUpcoming: newMovie.isUpcoming,
      };

      const created = await api.createMovie(moviePayload as any);
      setFeedback({ type: 'success', message: `Movie "${created.title}" successfully registered into repertoire.` });

      // Reset Form
      setNewMovie({
        title: '',
        originalTitle: '',
        language: 'English',
        genres: 'Drama',
        runtimeMinutes: 120,
        releaseDate: '2026-06-15',
        certification: 'UA',
        rating: 8.5,
        synopsis: '',
        posterUrl: '',
        isNowShowing: true,
        isUpcoming: false,
        director: '',
        cast: '',
      });
      setPosterFile(null);
      setPosterPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadData();
      onMovieAdded?.(created);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create movie record.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (movie: Movie) => {
    if (!window.confirm(`Are you sure you want to delete "${movie.title}" from the repertoire? Any associated showtimes will also be removed.`)) {
      return;
    }
    try {
      await api.deleteMovie(movie.id);
      setFeedback({ type: 'success', message: `Movie "${movie.title}" deleted successfully.` });
      await loadData();
      onMovieDeleted?.(movie.id);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete movie.' });
    }
  };

  // Submit Theatre
  const handleCreateTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const created = await api.createTheatre(newTheatre);
      setFeedback({ type: 'success', message: `Theatre "${created.name}" registered successfully.` });
      setNewTheatre({
        name: '',
        location: '',
        city: 'Chennai',
        screenName: 'Screen 1',
        screenType: 'Dolby Atmos 4K',
        capacity: 100,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create theatre.' });
    }
  };

  // Delete Theatre
  const handleDeleteTheatre = async (t: Theatre) => {
    if (!window.confirm(`Are you sure you want to delete theatre venue "${t.name}"?`)) return;
    try {
      await api.deleteTheatre(t.id);
      setFeedback({ type: 'success', message: `Theatre "${t.name}" removed.` });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete theatre.' });
    }
  };

  // Submit Showtime
  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const created = await api.createShowtime(newShowtime);
      setFeedback({ type: 'success', message: `Showtime successfully published for ${created.date} at ${created.time}.` });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create showtime.' });
    }
  };

  // Delete Showtime
  const handleDeleteShowtime = async (st: Showtime) => {
    try {
      await api.deleteShowtime(st.id);
      setFeedback({ type: 'success', message: 'Showtime successfully removed.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove showtime.' });
    }
  };

  // Filter repertoire list
  const filteredMovies = movies.filter((m) => {
    if (!searchMovieQuery.trim()) return true;
    const q = searchMovieQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.language.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      (m.director ? m.director.toLowerCase().includes(q) : false)
    );
  });

  // Restricted Access View
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#fafafa] px-6 text-[#141414] text-center flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white border border-black/10 shadow-sm text-left">
          <div className="w-12 h-12 bg-black/5 flex items-center justify-center mb-5 border border-black/10">
            <Shield size={24} className="text-[#141414]" />
          </div>
          <div className="label-mono text-[10px] text-[#8e8e8e] mb-1">CURATOR LEVEL CLEARANCE REQUIRED</div>
          <h2 className="text-2xl font-normal uppercase tracking-tight mb-2">Restricted Curator Console</h2>
          <p className="text-xs text-[#8e8e8e] mb-6 leading-relaxed">
            Administrative credentials are required to register new film titles, modify poster artwork, configure cinema venues, and publish theatrical showtime schedules.
          </p>

          <div className="space-y-3">
            <button
              onClick={onOpenAuthModal}
              className="w-full py-3 border border-black/15 bg-white text-[#141414] label-xs hover:bg-[#fafafa] transition-colors"
            >
              AUTHENTICATE WITH CUSTOM CREDENTIALS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fafafa] text-[#141414] px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-black/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label-xs text-[#8e8e8e]">CINEMA CONTROL MATRIX</span>
              <span className="text-[#8e8e8e]">•</span>
              <span className="label-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                CURATOR AUTHORIZED
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-normal tracking-tight uppercase leading-none">
              MANAGEMENT CONSOLE
            </h1>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'movies', label: 'MOVIES & POSTERS', icon: Film, count: movies.length },
              { id: 'theatres', label: 'THEATRES', icon: MapPin, count: theatres.length },
              { id: 'showtimes', label: 'SHOWTIMES', icon: Clock, count: showtimes.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id as any);
                  setFeedback(null);
                }}
                className={`px-3.5 py-2 label-xs border flex items-center gap-2 transition-all ${
                  activeSection === tab.id
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-white text-[#141414] border-black/[0.08] hover:border-black/20'
                }`}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
                <span className={`label-mono text-[10px] px-1.5 py-0.2 ${
                  activeSection === tab.id ? 'bg-white/20 text-white' : 'bg-black/5 text-[#8e8e8e]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 font-mono">
              {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="label-xs font-bold underline">
              DISMISS
            </button>
          </div>
        )}

        {/* SECTION 1: MOVIES & POSTER REGISTRATION */}
        {activeSection === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-6 bg-white border border-black/[0.08] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/[0.06]">
                <h3 className="label-xs text-[#8e8e8e]">NEW TITLE REGISTRATION</h3>
                <span className="label-mono text-[10px] text-[#8e8e8e]">YEAR 2026 COMPLIANT</span>
              </div>

              <form onSubmit={handleCreateMovie} className="space-y-4 text-xs">
                {/* POSTER ARTWORK ATTACHMENT */}
                <div className="p-4 bg-[#fafafa] border border-black/[0.08]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-xs text-[#141414] font-semibold flex items-center gap-1.5">
                      <ImageIcon size={13} />
                      <span>MOVIE POSTER ARTWORK</span>
                    </label>
                    <span className="label-mono text-[9px] text-[#8e8e8e]">3:4 CINEMATIC RATIO</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    {/* 3:4 Poster Preview Card */}
                    <div className="sm:col-span-5 flex flex-col items-center">
                      <div className="relative w-full aspect-3/4 bg-[#ececeb] border border-black/15 overflow-hidden shadow-xs flex flex-col items-center justify-center text-center">
                        {posterPreview ? (
                          <>
                            <img
                              src={posterPreview}
                              alt="Poster preview"
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay tag preview */}
                            <div className="absolute top-1.5 left-1.5 bg-[#fafafa]/90 backdrop-blur-xs px-1.5 py-0.5 label-mono text-[8px] border border-black/10">
                              {newMovie.language.toUpperCase()}
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-left">
                              <div className="text-[10px] font-bold text-white uppercase truncate">
                                {newMovie.title || 'UNTITLED'}
                              </div>
                              <div className="text-[9px] text-amber-400 font-mono">
                                ★ {newMovie.rating} / 10
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 flex flex-col items-center text-[#8e8e8e]">
                            <ImageIcon size={28} className="mb-2 text-black/20" />
                            <span className="label-mono text-[10px]">NO POSTER ATTACHED</span>
                            <span className="text-[9px] text-[#8e8e8e]/80 mt-1">Upload or choose below</span>
                          </div>
                        )}
                      </div>

                      {posterPreview && (
                        <button
                          type="button"
                          onClick={handleClearPoster}
                          className="mt-2 text-[10px] font-mono text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <X size={12} />
                          <span>REMOVE POSTER</span>
                        </button>
                      )}
                    </div>

                    {/* Poster Input Controls */}
                    <div className="sm:col-span-7 space-y-3">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePosterFileChange}
                        className="hidden"
                      />

                      {/* File Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 border border-dashed border-black/25 bg-white hover:bg-black/5 flex items-center justify-center gap-2 label-xs transition-colors"
                      >
                        <Upload size={13} />
                        <span>{posterFile ? posterFile.name : 'UPLOAD IMAGE FROM DEVICE'}</span>
                      </button>

                      {/* Or Select from existing posters */}
                      {availablePosters.length > 0 && (
                        <div>
                          <label className="label-mono text-[9px] text-[#8e8e8e] block mb-1">
                            OR CHOOSE FROM REPERTORY POSTERS
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleSelectPresetPoster(e.target.value);
                            }}
                            value={availablePosters.includes(newMovie.posterUrl) ? newMovie.posterUrl : ''}
                            className="w-full px-2 py-1.5 border border-black/15 bg-white font-mono text-[11px] outline-hidden"
                          >
                            <option value="">Select a catalog poster...</option>
                            {availablePosters.map((p) => {
                              const filename = p.split('/').pop() || p;
                              return (
                                <option key={p} value={p}>
                                  {filename}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      {/* Or type custom URL */}
                      <div>
                        <label className="label-mono text-[9px] text-[#8e8e8e] block mb-1">
                          OR SPECIFY DIRECT IMAGE PATH / URL
                        </label>
                        <input
                          type="text"
                          value={posterPreview?.startsWith('data:') ? '' : newMovie.posterUrl}
                          onChange={(e) => {
                            setPosterFile(null);
                            setPosterPreview(e.target.value);
                            setNewMovie({ ...newMovie, posterUrl: e.target.value });
                          }}
                          placeholder="/posters/my-film.jpg or https://..."
                          className="w-full px-2.5 py-1.5 border border-black/15 font-mono text-[11px] outline-hidden bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Film Title */}
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">MOVIE TITLE (REQUIRED)</label>
                  <input
                    type="text"
                    required
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    placeholder="e.g. INTERSTELLAR"
                    className="w-full px-3 py-2 border border-black/15 uppercase font-medium outline-hidden"
                  />
                </div>

                {/* Director & Cast */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">DIRECTOR</label>
                    <input
                      type="text"
                      value={newMovie.director}
                      onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                      placeholder="e.g. Christopher Nolan"
                      className="w-full px-3 py-2 border border-black/15 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">LEAD CAST (COMMA SEP)</label>
                    <input
                      type="text"
                      value={newMovie.cast}
                      onChange={(e) => setNewMovie({ ...newMovie, cast: e.target.value })}
                      placeholder="Matthew McConaughey, Anne Hathaway"
                      className="w-full px-3 py-2 border border-black/15 outline-hidden"
                    />
                  </div>
                </div>

                {/* Language & Certification */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">LANGUAGE</label>
                    <select
                      value={newMovie.language}
                      onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                      className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                    >
                      <option value="English">English</option>
                      <option value="Taiwanese Mandarin">Taiwanese Mandarin</option>
                      <option value="Korean">Korean</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Telugu">Telugu</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">CERTIFICATION</label>
                    <select
                      value={newMovie.certification}
                      onChange={(e) => setNewMovie({ ...newMovie, certification: e.target.value as any })}
                      className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                    >
                      <option value="UA">UA</option>
                      <option value="A">A</option>
                      <option value="U">U</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                    </select>
                  </div>
                </div>

                {/* Release Date, Runtime, Rating */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">RELEASE DATE</label>
                    <input
                      type="date"
                      required
                      value={newMovie.releaseDate}
                      onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
                      className="w-full px-2 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">RUNTIME (MIN)</label>
                    <input
                      type="number"
                      min={1}
                      value={newMovie.runtimeMinutes}
                      onChange={(e) => setNewMovie({ ...newMovie, runtimeMinutes: Number(e.target.value) })}
                      className="w-full px-2 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">RATING (0-10)</label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={10}
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
                      className="w-full px-2 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                </div>

                {/* Genres & Quick Toggle Pills */}
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">GENRES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={newMovie.genres}
                    onChange={(e) => setNewMovie({ ...newMovie, genres: e.target.value })}
                    placeholder="Action, Sci-Fi, Drama"
                    className="w-full px-3 py-2 border border-black/15 outline-hidden"
                  />
                  {/* Genre helper chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COMMON_GENRES.map((g) => {
                      const isSelected = newMovie.genres
                        .toLowerCase()
                        .includes(g.toLowerCase());
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`px-2 py-0.5 label-mono text-[9px] border transition-colors ${
                            isSelected
                              ? 'bg-[#141414] text-white border-[#141414]'
                              : 'bg-white text-[#8e8e8e] border-black/10 hover:border-black/30 hover:text-[#141414]'
                          }`}
                        >
                          {isSelected ? `✓ ${g}` : `+ ${g}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">SYNOPSIS (REQUIRED)</label>
                  <textarea
                    rows={3}
                    required
                    value={newMovie.synopsis}
                    onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                    placeholder="Enter curated film synopsis and premise..."
                    className="w-full px-3 py-2 border border-black/15 outline-hidden"
                  />
                </div>

                {/* Status Radio / Toggles */}
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="screeningStatus"
                      checked={newMovie.isNowShowing}
                      onChange={() => setNewMovie({ ...newMovie, isNowShowing: true, isUpcoming: false })}
                    />
                    <span className="label-xs font-semibold text-emerald-800">NOW SHOWING</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="screeningStatus"
                      checked={newMovie.isUpcoming}
                      onChange={() => setNewMovie({ ...newMovie, isNowShowing: false, isUpcoming: true })}
                    />
                    <span className="label-xs font-semibold text-amber-800">UPCOMING PREMIERE</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#141414] text-white label-xs hover:bg-black/85 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{isSubmitting ? 'UPLOADING & REGISTERING...' : 'REGISTER MOVIE TITLE'}</span>
                </button>
              </form>
            </div>

            {/* Current Repertoire Column */}
            <div className="lg:col-span-6 bg-white border border-black/[0.08] p-6 shadow-xs flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-black/[0.06] gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="label-xs text-[#8e8e8e]">CURRENT REPERTOIRE</h3>
                  <span className="label-mono text-[10px] bg-black/5 px-2 py-0.5">
                    {filteredMovies.length} TITLES
                  </span>
                </div>
                {/* Search Bar */}
                <div className="relative w-full sm:w-48">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-[#8e8e8e]" />
                  <input
                    type="text"
                    value={searchMovieQuery}
                    onChange={(e) => setSearchMovieQuery(e.target.value)}
                    placeholder="Search catalogue..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-black/10 outline-hidden bg-[#fafafa]"
                  />
                </div>
              </div>

              {/* Movie List with 3:4 Posters */}
              <div className="divide-y divide-black/[0.06] overflow-y-auto max-h-[680px] pr-2 space-y-1">
                {filteredMovies.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8e8e8e] font-mono">
                    NO MOVIES MATCHING FILTER CRITERIA
                  </div>
                ) : (
                  filteredMovies.map((m) => (
                    <div
                      key={m.id}
                      className="py-3 flex items-start justify-between gap-3 group hover:bg-[#fafafa] px-2 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* 3:4 Poster Thumbnail */}
                        <div className="w-14 aspect-3/4 bg-[#f0f0ef] border border-black/10 overflow-hidden shrink-0 shadow-2xs relative">
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback styling if poster fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div>
                          <div className="font-bold text-xs uppercase text-[#141414] group-hover:underline">
                            {m.title}
                          </div>
                          <div className="text-[11px] text-[#8e8e8e] mt-0.5">
                            {m.language} • {m.genres.join(' / ')}
                          </div>
                          <div className="text-[10px] text-[#8e8e8e] mt-1 font-mono flex items-center gap-2">
                            <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                              ★ {m.rating}
                            </span>
                            <span>•</span>
                            <span>{m.certification}</span>
                            <span>•</span>
                            <span>{m.runtimeMinutes}M</span>
                            <span>•</span>
                            <span>{m.releaseDate}</span>
                          </div>
                          {m.director && (
                            <div className="text-[10px] text-[#8e8e8e]/80 mt-0.5">
                              Dir: {m.director}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`label-mono text-[9px] px-2 py-0.5 ${
                            m.isNowShowing
                              ? 'bg-black text-white'
                              : 'bg-black/5 text-[#8e8e8e]'
                          }`}
                        >
                          {m.isNowShowing ? 'NOW SHOWING' : 'UPCOMING'}
                        </span>

                        <button
                          onClick={() => handleDeleteMovie(m)}
                          title="Delete movie"
                          className="p-1.5 text-black/30 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: THEATRES */}
        {activeSection === 'theatres' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white border border-black/[0.08] p-6 shadow-xs">
              <h3 className="label-xs text-[#8e8e8e] mb-4">ADD CINEMA VENUE</h3>
              <form onSubmit={handleCreateTheatre} className="space-y-4 text-xs">
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">THEATRE NAME</label>
                  <input
                    type="text"
                    required
                    value={newTheatre.name}
                    onChange={(e) => setNewTheatre({ ...newTheatre, name: e.target.value })}
                    placeholder="e.g. Luxe Cinemas"
                    className="w-full px-3 py-2 border border-black/15 outline-hidden"
                  />
                </div>
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">LOCATION / NEIGHBORHOOD</label>
                  <input
                    type="text"
                    required
                    value={newTheatre.location}
                    onChange={(e) => setNewTheatre({ ...newTheatre, location: e.target.value })}
                    placeholder="e.g. Phoenix MarketCity, Velachery"
                    className="w-full px-3 py-2 border border-black/15 outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">CITY</label>
                    <input
                      type="text"
                      value={newTheatre.city}
                      onChange={(e) => setNewTheatre({ ...newTheatre, city: e.target.value })}
                      className="w-full px-3 py-2 border border-black/15 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">CAPACITY</label>
                    <input
                      type="number"
                      min={10}
                      value={newTheatre.capacity}
                      onChange={(e) => setNewTheatre({ ...newTheatre, capacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">PRIMARY SCREEN NAME</label>
                  <input
                    type="text"
                    required
                    value={newTheatre.screenName}
                    onChange={(e) => setNewTheatre({ ...newTheatre, screenName: e.target.value })}
                    placeholder="Screen 1 (IMAX Laser)"
                    className="w-full px-3 py-2 border border-black/15 outline-hidden"
                  />
                </div>
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">AUDIO / VISUAL SPECIFICATION</label>
                  <select
                    value={newTheatre.screenType}
                    onChange={(e) => setNewTheatre({ ...newTheatre, screenType: e.target.value })}
                    className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                  >
                    <option value="Dolby Atmos 4K">Dolby Atmos 4K</option>
                    <option value="IMAX with Laser">IMAX with Laser</option>
                    <option value="EPIQ Premium Large Format">EPIQ Premium Large Format</option>
                    <option value="Standard Laser 2K">Standard Laser 2K</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#141414] text-white label-xs hover:bg-black/85 transition-colors mt-2"
                >
                  REGISTER VENUE
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-black/[0.08] p-6 shadow-xs">
              <h3 className="label-xs text-[#8e8e8e] mb-4">REGISTERED VENUES ({theatres.length})</h3>
              <div className="space-y-3">
                {theatres.map((t) => (
                  <div key={t.id} className="p-4 border border-black/[0.06] bg-[#fafafa] flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-[#141414]">{t.name}</div>
                      <div className="text-xs text-[#8e8e8e] mt-0.5">{t.location}, {t.city}</div>
                      <div className="mt-2 text-[10px] font-mono text-[#8e8e8e]">
                        Screens: {t.screens.map((s) => `${s.name} (${s.type || 'Dolby'})`).join(' • ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTheatre(t)}
                      className="p-1.5 text-black/30 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title="Remove venue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SHOWTIMES */}
        {activeSection === 'showtimes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white border border-black/[0.08] p-6 shadow-xs">
              <h3 className="label-xs text-[#8e8e8e] mb-4">CONFIGURE NEW SHOWTIME</h3>
              <form onSubmit={handleCreateShowtime} className="space-y-4 text-xs">
                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">SELECT MOVIE</label>
                  <select
                    value={newShowtime.movieId}
                    onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                    className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.language})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-xs text-[#8e8e8e] block mb-1">SELECT THEATRE</label>
                  <select
                    value={newShowtime.theatreId}
                    onChange={(e) => setNewShowtime({ ...newShowtime, theatreId: e.target.value })}
                    className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                  >
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">DATE</label>
                    <input
                      type="date"
                      required
                      value={newShowtime.date}
                      onChange={(e) => setNewShowtime({ ...newShowtime, date: e.target.value })}
                      className="w-full px-3 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">START TIME</label>
                    <input
                      type="time"
                      required
                      value={newShowtime.time}
                      onChange={(e) => setNewShowtime({ ...newShowtime, time: e.target.value })}
                      className="w-full px-3 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">FORMAT</label>
                    <select
                      value={newShowtime.format}
                      onChange={(e) => setNewShowtime({ ...newShowtime, format: e.target.value as any })}
                      className="w-full px-2 py-2 border border-black/15 bg-white font-mono outline-hidden"
                    >
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="4DX">4DX</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">BASE PRICE (₹)</label>
                    <input
                      type="number"
                      required
                      value={newShowtime.price}
                      onChange={(e) => setNewShowtime({ ...newShowtime, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-black/15 font-mono outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#141414] text-white label-xs hover:bg-black/85 transition-colors mt-2"
                >
                  PUBLISH SHOWTIME
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-black/[0.08] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-black/[0.06] gap-2">
                <h3 className="label-xs text-[#8e8e8e]">
                  SCHEDULED SHOWTIMES ({showtimes.filter((st) => showtimeMovieFilter === 'ALL' || String(st.movieId) === String(showtimeMovieFilter)).length}
                  {showtimeMovieFilter !== 'ALL' ? ` OF ${showtimes.length}` : ''})
                </h3>
                <div className="flex items-center gap-2">
                  <span className="label-xs text-[10px] text-[#8e8e8e]">FILTER:</span>
                  <select
                    value={showtimeMovieFilter}
                    onChange={(e) => setShowtimeMovieFilter(e.target.value)}
                    aria-label="Filter showtimes by movie"
                    className="px-2 py-1 border border-black/15 bg-white text-xs font-mono outline-hidden max-w-[200px] truncate"
                  >
                    <option value="ALL">ALL MOVIES ({showtimes.length})</option>
                    {movies.map((m) => {
                      const count = showtimes.filter((st) => String(st.movieId) === String(m.id)).length;
                      return (
                        <option key={m.id} value={m.id}>
                          {m.title} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="divide-y divide-black/[0.06] max-h-[500px] overflow-y-auto pr-2">
                {showtimes
                  .filter((st) => showtimeMovieFilter === 'ALL' || String(st.movieId) === String(showtimeMovieFilter))
                  .map((st) => {
                    const m = movies.find((mov) => String(mov.id) === String(st.movieId));
                    const t = theatres.find((the) => String(the.id) === String(st.theatreId || (st as any).theaterId));
                    return (
                      <div key={st.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-[#fafafa] px-1 transition-colors">
                        <div>
                          <div className="font-semibold text-[#141414] uppercase">
                            {m?.title || st.movieId}
                          </div>
                          <div className="text-[10px] text-[#8e8e8e]">
                            {t?.name} • {st.screenName}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="font-bold text-[#141414]">
                              {st.date} at {st.time}
                            </div>
                            <div className="text-[10px] text-[#8e8e8e]">
                              {st.format} • ₹{st.price}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteShowtime(st)}
                            className="p-1 text-black/25 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Remove showtime"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};