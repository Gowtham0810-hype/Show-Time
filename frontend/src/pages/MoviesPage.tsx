import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';
import { Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

interface MoviesPageProps {
  onSelectMovie: (movie: Movie) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({ onSelectMovie }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'showing' | 'upcoming'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const list = await api.getMovies();
        setMovies(list);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  const languages = ['all', 'English', 'Mandarin', 'Korean'];
  const genres = ['all', 'Action', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Crime', 'Biography'];

  const filtered = movies.filter((m) => {
    // Tab filter
    if (activeTab === 'showing' && !m.isNowShowing) return false;
    if (activeTab === 'upcoming' && !m.isUpcoming) return false;

    // Language filter
    if (selectedLanguage !== 'all' && m.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
      return false;
    }

    // Genre filter
    if (selectedGenre !== 'all' && !m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDirector = m.director?.toLowerCase().includes(q);
      const matchGenre = m.genres.some((g) => g.toLowerCase().includes(q));
      if (!matchTitle && !matchDirector && !matchGenre) return false;
    }

    return true;
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fafafa] text-[#141414] px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Editorial Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-8 border-b border-black/[0.08] gap-4">
          <div>
            <div className="label-xs text-[#8e8e8e] mb-2">CURATED PROGRAMME</div>
            <h1 className="text-4xl md:text-6xl font-normal tracking-tight uppercase leading-none">
              ALL TITLES
            </h1>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72 flex items-center gap-2 bg-white border border-black/[0.1] px-3 py-2.5 focus-within:border-black transition-colors">
            <Search size={14} className="text-[#8e8e8e]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH TITLES, GENRES..."
              className="bg-transparent border-none outline-hidden text-xs font-mono uppercase w-full placeholder:text-[#8e8e8e]"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-black/[0.04]">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'showing', 'upcoming'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 label-xs border transition-all ${
                  activeTab === tab
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-white text-[#141414] border-black/[0.08] hover:border-black/20'
                }`}
              >
                {tab === 'all' ? 'ALL TITLES' : tab === 'showing' ? 'NOW SHOWING' : 'UPCOMING'}
              </button>
            ))}
          </div>

          {/* Secondary Language & Genre selectors */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <span className="label-xs text-[#8e8e8e]">LANG:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white border border-black/10 px-2 py-1 text-xs font-mono uppercase outline-hidden"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="label-xs text-[#8e8e8e]">GENRE:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-white border border-black/10 px-2 py-1 text-xs font-mono uppercase outline-hidden"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-[#8e8e8e]">
            LOADING REPERTOIRE...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white border border-black/[0.08] p-8">
            <p className="text-sm font-mono text-[#8e8e8e] uppercase mb-4">
              No matching cinematographic titles found
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
                setSelectedLanguage('all');
                setSelectedGenre('all');
              }}
              className="px-4 py-2 border border-black/15 text-xs font-medium hover:bg-black/5"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Poster container with subtle hover scale */}
                <div className="relative aspect-3/4 bg-[#f2f2f1] overflow-hidden border border-black/[0.08] mb-3">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                  />
                  <div className="absolute top-2 left-2 bg-[#fafafa]/90 backdrop-blur-xs px-2 py-0.5 label-mono text-[9px] border border-black/10">
                    {movie.language.toUpperCase()}
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141414] text-white p-1.5">
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-xs md:text-sm uppercase tracking-tight text-[#141414] group-hover:underline truncate">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-[#8e8e8e] truncate mt-0.5">
                      {movie.genres.join(' / ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-black/[0.04] text-[10px] font-mono text-[#8e8e8e]">
                    <span>{movie.certification} • {movie.runtimeMinutes}M</span>
                    <span
                      className={`font-semibold ${
                        movie.isNowShowing ? 'text-[#141414]' : 'text-amber-700'
                      }`}
                    >
                      {movie.isNowShowing ? 'SHOWING' : 'UPCOMING'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
