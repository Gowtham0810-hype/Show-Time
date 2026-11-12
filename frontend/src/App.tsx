import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MinimalNav } from './components/navigation/MinimalNav';
import { HomePage } from './pages/HomePage';
import { MovieDetailsView } from './components/movie/MovieDetailsView';
import { SeatBookingView } from './components/booking/SeatBookingView';
import { MoviesPage } from './pages/MoviesPage';
import { AlertsPage } from './pages/AlertsPage';
import { BookingsPage } from './pages/BookingsPage';
import { TicketView } from './pages/TicketView';
import { AdminPage } from './pages/AdminPage';
import { AuthModal } from './components/auth/AuthModal';
import { api, getStoredUser, setStoredUser } from './services/api';
import { Movie, Showtime, Booking, ReleaseAlert, User } from './types';

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Global User and Database State
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [movies, setMovies] = useState<Movie[]>([]);
  const [alerts, setAlerts] = useState<ReleaseAlert[]>([]);

  // Selected entities for modals / overlays
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeShowtime, setActiveShowtime] = useState<Showtime | null>(null);
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function init() {
      try {
        const [mList, aList] = await Promise.all([
          api.getMovies(),
          api.getAlerts(user?.email || 'adamgoya0810@gmail.com'),
        ]);
        setMovies(mList);
        setAlerts(aList);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, [user]);

  // Movie selection opens details overlay
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  // Showtime selection opens 2D seat reservation
  const handleSelectShowtime = (showtime: Showtime) => {
    setActiveShowtime(showtime);
  };

  // Booking completion
  const handleBookingSuccess = (booking: Booking) => {
    setActiveShowtime(null);
    setSelectedMovie(null);
    navigate(`/bookings/${booking.bookingReference}`);
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#141414] relative selection:bg-[#141414] selection:text-white">
      {/* Minimal Top Navigation */}
      <MinimalNav
        user={user}
        alerts={alerts}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Routes */}
      <Routes>
        {/* Homepage: Vertical Sections with Horizontal 3D Leaning Cards */}
        <Route
          path="/"
          element={
            <HomePage
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onHoverMovie={setHoveredMovie}
              hoveredMovieId={hoveredMovie?.id}
            />
          }
        />

        {/* Dedicated Movies Directory */}
        <Route
          path="/movies"
          element={
            <MoviesPage
              onSelectMovie={(movie) => {
                setSelectedMovie(movie);
              }}
            />
          }
        />




        {/* Alerts Page */}
        <Route
          path="/alerts"
          element={
            <AlertsPage
              user={user}
              onSelectMovie={(movie) => {
                setSelectedMovie(movie);
              }}
            />
          }
        />

        {/* Bookings List Page */}
        <Route path="/bookings" element={<BookingsPage user={user} />} />

        {/* Single Booking Digital Pass Page */}
        <Route path="/bookings/:ref" element={<TicketView />} />

        {/* Admin Console */}
        <Route
          path="/admin"
          element={
            <AdminPage
              user={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onMovieAdded={(newMov) => {
                setMovies((prev) => [newMov, ...prev.filter((m) => m.id !== newMov.id)]);
              }}
              onMovieDeleted={(movieId) => {
                setMovies((prev) => prev.filter((m) => m.id !== movieId));
              }}
            />
          }
        />
      </Routes>

      {/* Movie Details Editorial Overlay */}
      {selectedMovie && !activeShowtime && (
        <MovieDetailsView
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}

      {/* Seat Selection & 5-Min Hold Booking Screen */}
      {activeShowtime && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fafafa]">
          <SeatBookingView
            showtime={activeShowtime}
            movieTitle={selectedMovie?.title || 'Selected Presentation'}
            theatreName={
              activeShowtime.screenName ? `Auditorium: ${activeShowtime.screenName}` : 'Cinema Auditorium'
            }
            user={user}
            onBack={() => setActiveShowtime(null)}
            onBookingSuccess={handleBookingSuccess}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setStoredUser(authenticatedUser);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
