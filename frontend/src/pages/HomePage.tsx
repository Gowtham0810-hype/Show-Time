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

      {/* ── CINEMATIC HERO BANNER (Full-Bleed Edge-to-Edge Upper Section) ──── */}
      <div className="relative w-full aspect-[1024/426] min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[640px] max-h-[85vh] bg-black flex flex-col justify-end overflow-hidden mb-6">
        {/* Full-width Background Image (100% visible, no heavy darkening) */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_top_20%] bg-no-repeat"
          style={{ backgroundImage: `url('/fightclub-hero.jpg')` }}
        />

        {/* Hero Content Overlay */}
        <div className="relative z-10 px-6 sm:px-12 md:px-16 pb-8 sm:pb-12 max-w-4xl text-left pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-black font-extrabold tracking-[0.2em] uppercase text-[11px] sm:text-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.6)] mb-3 sm:mb-4 border border-white">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            FIRST RULE OF FILM CLUB: TALK ABOUT FILM CLUB
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            DO NOT MISS A SHOW EVER
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/95 mt-3 sm:mt-4 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Discover curated repertoire cinema, explore theatrical showtimes, and reserve your seats with sub-second concurrency. Instant release alerts ensure you never miss a premiere.
          </p>
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
