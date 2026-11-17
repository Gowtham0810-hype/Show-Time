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
    <div className="pt-24 md:pt-[94px] pb-32 min-h-screen bg-[#fafafa] text-[#141414] overflow-x-hidden">

      {/* ── CINEMATIC HERO BANNER (Positioned below navigation, screen-fitted) ── */}
      <div className="relative w-full h-[340px] sm:h-[400px] md:h-[450px] lg:h-[480px] bg-black flex flex-col justify-end overflow-hidden mb-8 border-b border-black/10">
        {/* Full-width Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[center_35%] bg-no-repeat"
          style={{ backgroundImage: `url('/fightclub-hero.jpg')` }}
        />

        {/* Hero Content Overlay */}
        <div className="relative z-10 px-6 sm:px-10 md:px-14 pb-6 sm:pb-8 max-w-3xl text-left pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black font-extrabold tracking-[0.2em] uppercase text-[10px] sm:text-[11px] shadow-[0_4px_16px_rgba(0,0,0,0.6)] mb-2.5 sm:mb-3 border border-white">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            FIRST RULE OF FILM CLUB: TALK ABOUT FILM CLUB
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-[0.95] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            DO NOT MISS A SHOW EVER
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/95 mt-2 sm:mt-2.5 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
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
