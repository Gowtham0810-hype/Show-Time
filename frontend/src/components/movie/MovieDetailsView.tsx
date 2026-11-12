import React, { useState, useEffect } from 'react';
import { Movie, Showtime, Theatre } from '../../types';
import { api } from '../../services/api';
import { ArrowLeft, Clock, Calendar, Star, Sparkles, MapPin, ChevronRight, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MovieDetailsViewProps {
  movie: Movie;
  onClose: () => void;
  onSelectShowtime: (showtime: Showtime) => void;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  movie,
  onClose,
  onSelectShowtime,
}) => {
  const navigate = useNavigate();
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Generate selectable dates for next 5 days
  useEffect(() => {
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

  // Fetch Theatres and Showtimes
  useEffect(() => {
    async function loadData() {
      try {
        const tList = await api.getTheatres();
        setTheatres(tList);

        if (movie.isNowShowing) {
          setLoadingShowtimes(true);
          const dateParam = selectedDate || (availableDates.length > 0 ? availableDates[0] : new Date().toISOString().split('T')[0]);
          const stList = await api.getShowtimes({ movieId: String(movie.id), date: dateParam });
          setShowtimes(stList);
          setLoadingShowtimes(false);
        }
      } catch (err) {
        console.error('Error fetching showtimes:', err);
        setLoadingShowtimes(false);
      }
    }
    loadData();
  }, [movie.id, selectedDate, movie.isNowShowing]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubscribeAlert = async () => {
    try {
      await api.createAlert(movie.id, movie.title, 'adamgoya0810@gmail.com', `Release alert for ${movie.title}`);
      setAlertSuccess(true);
    } catch {
      // route to assistant
      navigate('/assistant');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fafafa] text-[#141414] animate-fadeIn">
      {/* Top Sticky Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#fafafa]/90 backdrop-blur-md border-b border-black/[0.08]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 label-xs text-[#141414] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={16} />
          <span>RETURN TO REPERTOIRE (ESC)</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="label-mono text-[10px] text-[#8e8e8e]">
            {movie.language.toUpperCase()} / {movie.certification}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-black/10 hover:bg-black/5 transition-colors"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Editorial Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start pb-16 border-b border-black/[0.08]">
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="label-xs text-[#8e8e8e]">
                {movie.isNowShowing ? 'IN THEATRES NOW' : 'UPCOMING RELEASE'}
              </span>
              <span className="text-[#8e8e8e]">•</span>
              <span className="label-xs text-[#8e8e8e]">{movie.genres.join(', ')}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-normal tracking-tight uppercase mb-4 leading-none">
              {movie.title}
            </h1>

            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-xl text-[#8e8e8e] font-serif italic mb-6">
                {movie.originalTitle}
              </p>
            )}

            <p className="text-base md:text-lg text-[#141414]/85 leading-relaxed max-w-xl mb-8">
              {movie.synopsis}
            </p>

            {/* Metadata specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-black/[0.06]">
              <div>
                <div className="label-xs text-[#8e8e8e] mb-1">RUNTIME</div>
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Clock size={13} className="text-[#8e8e8e]" />
                  <span>{movie.runtimeMinutes} MIN</span>
                </div>
              </div>
              <div>
                <div className="label-xs text-[#8e8e8e] mb-1">RELEASE</div>
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#8e8e8e]" />
                  <span>{movie.releaseDate}</span>
                </div>
              </div>
              <div>
                <div className="label-xs text-[#8e8e8e] mb-1">RATING</div>
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Star size={13} className="text-amber-600 fill-amber-600" />
                  <span>{movie.rating ?? '8.8'} / 10</span>
                </div>
              </div>
              <div>
                <div className="label-xs text-[#8e8e8e] mb-1">DIRECTOR</div>
                <div className="text-sm font-medium truncate">
                  {movie.director || 'Curated'}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Poster Card */}
          <div className="md:col-span-5">
            <div className="relative aspect-3/4 bg-[#f2f2f1] overflow-hidden border border-black/[0.08] shadow-sm">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
              />
              <div className="absolute bottom-3 left-3 bg-[#fafafa]/90 backdrop-blur-md px-3 py-1 label-mono text-[10px] border border-black/10">
                {movie.certification} • {movie.language.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Section: Two-Column Image Grid as specified in Section 6 */}
        <div className="py-16 border-b border-black/[0.08]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="label-xs text-[#8e8e8e]">CINEMATOGRAPHIC STILLS</h2>
            <span className="label-mono text-[10px] text-[#8e8e8e]">35MM ARCHIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="aspect-16/10 bg-[#f2f2f1] overflow-hidden border border-black/[0.08]">
                <img
                  src={movie.backdropUrl}
                  alt={`${movie.title} backdrop`}
                  className="w-full h-full object-cover"
                />
              </div>
              {movie.stillImages[0] && (
                <div className="aspect-4/3 bg-[#f2f2f1] overflow-hidden border border-black/[0.08]">
                  <img
                    src={movie.stillImages[0]}
                    alt={`${movie.title} production still`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {movie.stillImages[1] ? (
                <div className="aspect-4/3 bg-[#f2f2f1] overflow-hidden border border-black/[0.08]">
                  <img
                    src={movie.stillImages[1]}
                    alt={`${movie.title} production still`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-4/3 bg-[#f2f2f1] overflow-hidden border border-black/[0.08] p-8 flex flex-col justify-end">
                  <span className="label-xs text-[#8e8e8e] mb-1">CAST ENSEMBLE</span>
                  <p className="text-sm text-[#141414] font-medium">
                    {movie.cast?.join(', ') || 'Original Theatrical Cast'}
                  </p>
                </div>
              )}
              {movie.stillImages[2] && (
                <div className="aspect-16/10 bg-[#f2f2f1] overflow-hidden border border-black/[0.08]">
                  <img
                    src={movie.stillImages[2]}
                    alt={`${movie.title} still`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Showtimes & Booking Section as specified in Section 6 */}
        <div className="py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="label-xs text-[#8e8e8e] mb-2">RESERVATION DESK</div>
              <h2 className="text-3xl font-normal tracking-tight uppercase">
                {movie.isNowShowing ? 'AVAILABLE SCREENINGS' : 'RELEASE STATUS'}
              </h2>
            </div>

            {/* Date Selector Pills */}
            {movie.isNowShowing && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {availableDates.map((dateStr) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dayNum = d.getDate();
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-3.5 py-2 border flex flex-col items-center min-w-[62px] transition-all ${
                        isSelected
                          ? 'bg-[#141414] text-white border-[#141414]'
                          : 'bg-[#fafafa] text-[#141414] border-black/[0.08] hover:border-black/20'
                      }`}
                    >
                      <span className="label-xs text-[9px] tracking-wider opacity-80">{dayName}</span>
                      <span className="text-sm font-semibold tracking-tight">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Showtimes Rows grouped by Theatre */}
          {movie.isNowShowing ? (
            loadingShowtimes ? (
              <div className="py-16 text-center text-sm font-mono text-[#8e8e8e] uppercase">
                RETRIEVING SHOWTIMES FOR {selectedDate}...
              </div>
            ) : showtimes.length > 0 ? (
              <div className="space-y-6">
                {theatres.map((theatre) => {
                  const theatreShows = showtimes.filter((st) => String(st.theatreId || (st as any).theaterId) === String(theatre.id));
                  if (theatreShows.length === 0) return null;

                  return (
                    <div
                      key={theatre.id}
                      className="p-6 bg-white border border-black/[0.08] transition-all hover:border-black/15"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-black/[0.06] gap-2">
                        <div>
                          <h3 className="text-lg font-medium tracking-tight text-[#141414]">
                            {theatre.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#8e8e8e] mt-0.5">
                            <MapPin size={12} />
                            <span>{theatre.location}, {theatre.city}</span>
                          </div>
                        </div>
                        <span className="label-mono text-[10px] text-[#8e8e8e]">
                          {theatreShows.length} SCREENINGS TODAY
                        </span>
                      </div>

                      {/* Showtime Buttons with Screen Info & Price */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {theatreShows.map((show) => (
                          <button
                            key={show.id}
                            onClick={() => onSelectShowtime(show)}
                            className="group p-3 border border-black/[0.08] hover:border-[#141414] hover:bg-[#141414] hover:text-white transition-all text-left flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold tracking-tight">
                                {show.time}
                              </span>
                              <span className="label-mono text-[9px] px-1 bg-black/[0.06] group-hover:bg-white/20">
                                {show.format}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#8e8e8e] group-hover:text-white/70 truncate">
                              {show.screenName}
                            </div>
                            <div className="mt-2 text-xs font-mono font-medium pt-1.5 border-t border-black/[0.04] group-hover:border-white/10 flex items-center justify-between">
                              <span>₹{show.price}</span>
                              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-black/[0.08]">
                <p className="text-sm font-mono text-[#8e8e8e] uppercase mb-4">
                  No showtimes listed for {selectedDate}.
                </p>
                <button
                  onClick={() => setSelectedDate(availableDates[0])}
                  className="px-4 py-2 border border-black/15 text-xs font-medium hover:bg-black/5"
                >
                  VIEW EARLIEST AVAILABLE DATE
                </button>
              </div>
            )
          ) : (
            /* Upcoming Movie Alert Banner as specified in Section 6 */
            <div className="p-8 md:p-12 bg-white border border-black/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="label-xs text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200">
                  BOOKING NOT OPEN YET
                </span>
                <h3 className="text-2xl font-normal tracking-tight uppercase mt-3 mb-2">
                  Releasing into theatres on {movie.releaseDate}
                </h3>
                <p className="text-sm text-[#8e8e8e] leading-relaxed">
                  Screen reservations have not yet commenced. Set an instant release alert to be alerted the second theatrical showtimes open.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {alertSuccess ? (
                  <div className="px-5 py-3.5 bg-emerald-800 text-white text-xs font-mono flex items-center gap-2">
                    <span>✓ RELEASE ALERT CONFIGURED</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSubscribeAlert}
                    className="px-6 py-3.5 bg-[#141414] text-white hover:bg-black/85 transition-colors label-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell size={14} />
                    <span>SET RELEASE ALERT</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/alerts')}
                  className="px-5 py-3.5 border border-black/15 hover:bg-black/5 text-[#141414] transition-colors label-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>VIEW MY ALERTS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
