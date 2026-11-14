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

      {/* ── TEXT HERO ─────────────────────────────────────────────────────── */}
      <div className="w-full px-6 sm:px-10 lg:px-14 mb-10 pb-4 text-left">
        <div className="text-[13px] md:text-[14px] font-semibold tracking-[0.16em] uppercase text-[#8e8e8e] mb-2.5">
          FIRST RULE OF FILM CLUB: TALK ABOUT FILM CLUB
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight uppercase leading-none max-w-5xl text-[#141414]">
          DO NOT MISS A SHOW EVER
        </h1>
        <p className="text-sm sm:text-base md:text-[17px] text-[#8e8e8e] mt-3.5 max-w-2xl leading-relaxed">
        Discover whats playing, find your perfect showtime, and book tickets through a simple conversation. Following an upcoming film? We will let you know the moment its showtimes go live.
        </p>
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
