import React from 'react';
import { Movie } from '../types';
import { Section3DCardRow } from '../components/gallery/Section3DCardRow';

interface HomePageProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onHoverMovie: (movie: Movie | null) => void;
  hoveredMovieId?: string | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  movies,
  onSelectMovie,
  onHoverMovie,
  hoveredMovieId,
}) => {
  const upcomingMovies = React.useMemo(() => movies.filter((m) => m.isUpcoming), [movies]);
  const nowShowingMovies = React.useMemo(() => movies.filter((m) => m.isNowShowing), [movies]);
  const horrorMovies = React.useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase() === 'horror')),
    [movies]
  );
  const scifiMovies = React.useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase() === 'sci-fi')),
    [movies]
  );

  return (
    <div className="pb-32 min-h-screen bg-[#fafafa] text-[#141414] overflow-x-hidden">

      {/* ── CINEMATIC HERO BANNER (Full Uncropped Image) ──────────────────── */}
      <div className="relative w-full bg-black mb-8 select-none">
        {/* Full Uncropped Image: 100% of the photograph rendered with zero cropping */}
        <img
          src="/fightclub-hero.jpg"
          alt="Film Club Cinema"
          className="w-full h-auto block"
        />

        {/* Minimal High-Contrast Badge at bottom-left */}
        <div className="absolute bottom-4 left-5 sm:bottom-6 sm:left-8 z-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-black font-extrabold tracking-[0.2em] uppercase text-[10px] sm:text-[11px] shadow-[0_6px_20px_rgba(0,0,0,0.6)] border border-white">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            FIRST RULE OF FILM CLUB: TALK ABOUT FILM CLUB
          </div>
        </div>
      </div>

      {/* Section 1: ALL REPERTOIRE */}
      <Section3DCardRow
        sectionId="sec-all"
        sectionNumber="01"
        sectionTitle="ALL SHOWS"
        sectionSubtitle="Comprehensive catalogue of all movies present"
        movies={movies}
        onSelectMovie={onSelectMovie}
        onHoverMovie={onHoverMovie}
        hoveredMovieId={hoveredMovieId}
      />

      {/* Section 2: UPCOMING */}
      <Section3DCardRow
        sectionId="sec-upcoming"
        sectionNumber="02"
        sectionTitle="UPCOMING PREMIERES"
        sectionSubtitle="Advance bookings opening soon • Instant AI release alerts enabled"
        movies={upcomingMovies}
        onSelectMovie={onSelectMovie}
        onHoverMovie={onHoverMovie}
        hoveredMovieId={hoveredMovieId}
      />

      {/* Section 3: NOW SHOWING */}
      <Section3DCardRow
        sectionId="sec-showing"
        sectionNumber="03"
        sectionTitle="NOW SHOWING"
        sectionSubtitle="Daily screenings with real-time seat availability"
        movies={nowShowingMovies}
        onSelectMovie={onSelectMovie}
        onHoverMovie={onHoverMovie}
        hoveredMovieId={hoveredMovieId}
      />

      {/* Section 4: HORROR */}
      <Section3DCardRow
        sectionId="sec-horror"
        sectionNumber="04"
        sectionTitle="HORROR CINEMA"
        sectionSubtitle="Psychological chills, supernatural mysteries, and visceral dread"
        movies={horrorMovies}
        onSelectMovie={onSelectMovie}
        onHoverMovie={onHoverMovie}
        hoveredMovieId={hoveredMovieId}
      />

      {/* Section 5: SCI-FI */}
      <Section3DCardRow
        sectionId="sec-scifi"
        sectionNumber="05"
        sectionTitle="SCI-FI CINEMA"
        sectionSubtitle="Speculative fiction, interstellar odysseys, and dystopian futures"
        movies={scifiMovies}
        onSelectMovie={onSelectMovie}
        onHoverMovie={onHoverMovie}
        hoveredMovieId={hoveredMovieId}
      />
    </div>
  );
};
