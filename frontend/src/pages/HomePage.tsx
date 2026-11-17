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
    <div className="pt-28 pb-32 min-h-screen bg-[#fafafa] text-[#141414] overflow-x-hidden">

      {/* ── CINEMATIC HERO BANNER ─────────────────────────────────────────── */}
      <div className="w-full px-4 sm:px-8 lg:px-12 mb-12">
        <div className="relative w-full rounded-2xl overflow-hidden bg-black text-white shadow-2xl min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex items-end border border-black/10">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center md:bg-[center_top_35%] scale-100 hover:scale-[1.02] transition-transform duration-1000 ease-out opacity-70"
            style={{ backgroundImage: `url('/fightclub-hero.jpg')` }}
          />
          {/* Multi-layer Cinematic Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-[12px] font-semibold tracking-[0.2em] uppercase text-neutral-300 mb-3 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              FIRST RULE OF FILM CLUB: TALK ABOUT FILM CLUB
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.95] text-white drop-shadow-md">
              DO NOT MISS A SHOW EVER
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-300 mt-3 sm:mt-4 max-w-2xl font-normal leading-relaxed drop-shadow">
              Discover what's playing, explore theatrical showtimes, and reserve your seats with sub-second concurrency. Never miss an upcoming premiere with instant release alerts.
            </p>
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
