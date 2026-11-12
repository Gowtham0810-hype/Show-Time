import React, { useState } from 'react';
import { Movie } from '../../types';
import { Search } from 'lucide-react';

interface IndexViewProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onHoverMovie: (movie: Movie | null) => void;
  hoveredMovieId?: string | null;
}

export const IndexView: React.FC<IndexViewProps> = ({
  movies,
  onSelectMovie,
  onHoverMovie,
  hoveredMovieId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = movies.filter((m) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.language.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed top-24 left-6 z-30 w-full max-w-lg max-h-[calc(100vh-140px)] flex flex-col bg-[#fafafa]/92 backdrop-blur-[16px] border border-black/[0.08] p-5 shadow-xs overflow-hidden">
      {/* Search Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.08]">
        <div className="flex items-center gap-2 text-[#141414]">
          <Search size={14} className="text-[#8e8e8e]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER BY TITLE, GENRE, LANGUAGE..."
            className="bg-transparent border-none outline-hidden text-[11px] font-mono placeholder:text-[#8e8e8e] w-64 uppercase"
          />
        </div>
        <span className="label-mono text-[10px] text-[#8e8e8e]">
          {filtered.length} TITLES
        </span>
      </div>

      {/* Rows Header */}
      <div className="grid grid-cols-12 gap-2 pb-2 text-[10px] uppercase tracking-wider text-[#8e8e8e] font-medium border-b border-black/[0.04]">
        <div className="col-span-1">#</div>
        <div className="col-span-5">TITLE</div>
        <div className="col-span-3">LANGUAGE</div>
        <div className="col-span-3 text-right">STATUS</div>
      </div>

      {/* Index Rows List */}
      <div className="overflow-y-auto divide-y divide-black/[0.04] pr-1">
        {filtered.map((movie, idx) => {
          const isHovered = hoveredMovieId === movie.id;
          return (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              onMouseEnter={() => onHoverMovie(movie)}
              onMouseLeave={() => onHoverMovie(null)}
              className={`grid grid-cols-12 gap-2 py-3 cursor-pointer items-center transition-colors duration-150 ${
                isHovered ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02]'
              }`}
            >
              <div className="col-span-1 label-mono text-[10px] text-[#8e8e8e]">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="col-span-5 font-medium text-[12px] uppercase tracking-wide text-[#141414] truncate">
                {movie.title}
              </div>
              <div className="col-span-3 text-[11px] text-[#8e8e8e] uppercase">
                {movie.language}
              </div>
              <div className="col-span-3 text-right">
                <span
                  className={`inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase ${
                    movie.isNowShowing
                      ? 'bg-black/[0.06] text-[#141414]'
                      : 'bg-black/[0.03] text-[#8e8e8e]'
                  }`}
                >
                  {movie.isNowShowing ? 'SHOWING' : 'UPCOMING'}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-[11px] text-[#8e8e8e] font-mono uppercase">
            No matching titles found
          </div>
        )}
      </div>
    </div>
  );
};
