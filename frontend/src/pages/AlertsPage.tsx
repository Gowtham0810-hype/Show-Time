import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ReleaseAlert, Movie, Theatre, User } from '../types';
import { Bell, Trash2, Calendar, Ticket, Check, Plus, X, MapPin, Film, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertsPageProps {
  user: User | null;
  onSelectMovie: (movie: Movie) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ user, onSelectMovie }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ReleaseAlert[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedTheatres, setSelectedTheatres] = useState<Record<string, string>>({});
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({});
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [cancelModalAlert, setCancelModalAlert] = useState<ReleaseAlert | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const email = user?.email || 'adamgoya0810@gmail.com';
      const data = await api.getAlerts(email);
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setLoading(false);
    }
  };

  const loadUpcomingCatalog = async () => {
    try {
      const [allMovies, allTheatres] = await Promise.all([
        api.getMovies(),
        api.getTheatres(),
      ]);
      const upcoming = allMovies.filter((m) => m.isUpcoming || !m.isNowShowing);
      setUpcomingMovies(upcoming);
      setTheatres(allTheatres);
    } catch (err) {
      console.error('Failed to load upcoming catalog:', err);
    }
  };

  useEffect(() => {
    loadAlerts();
    loadUpcomingCatalog();
  }, [user]);

  const handleToggleConfigure = () => {
    setIsConfiguring((prev) => !prev);
    if (!upcomingMovies.length) {
      loadUpcomingCatalog();
    }
  };

  const handleCreateAlert = async (movie: Movie) => {
    const movieIdStr = String(movie.id);
    const chosenTheatre = selectedTheatres[movieIdStr] || 'Any Theatre';
    const chosenFormat = selectedFormats[movieIdStr] || 'Any Format';
    const theatreParam = chosenTheatre === 'Any Theatre' ? null : chosenTheatre;
    const formatParam = chosenFormat === 'Any Format' ? null : chosenFormat;

    try {
      setSubscribingId(movieIdStr);
      await api.createAlert({
        movieId: movie.id,
        movieTitle: movie.title,
        theaterName: theatreParam,
        screenType: formatParam,
        userEmail: user?.email || 'adamgoya0810@gmail.com',
      });

      setFeedbackNotice(
        `Alert registered for ${movie.title}${theatreParam ? ` at ${theatreParam}` : ' across all Chennai venues'}!`
      );
      setTimeout(() => setFeedbackNotice(null), 5000);

      await loadAlerts();
    } catch (err) {
      console.error('Failed to create alert:', err);
      alert('Could not configure alert. Please check your connection.');
    } finally {
      setSubscribingId(null);
    }
  };

  const handleCancelAlert = async (alert: ReleaseAlert) => {
    try {
      await api.cancelAlert(alert.id);
      setCancelModalAlert(null);
      await loadAlerts();
    } catch (err) {
      console.error('Failed to cancel alert:', err);
    }
  };

  const handleBookNow = async (alert: ReleaseAlert) => {
    try {
      const movie = await api.getMovieById(alert.movieId);
      onSelectMovie(movie);
      navigate('/');
    } catch {
      navigate('/movies');
    }
  };

  const activeAlerts = alerts.filter((a) => a.status !== 'CANCELLED');

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fafafa] text-[#141414] px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-6 border-b border-black/[0.08] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label-xs text-[#8e8e8e]">AUTOMATED RELEASE SUBSCRIPTIONS</span>
              <span className="text-[#8e8e8e]">•</span>
              <span className="label-mono text-[10px] text-[#8e8e8e]">
                {activeAlerts.length} ACTIVE
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-normal tracking-tight uppercase leading-none">
              RELEASE ALERTS
            </h1>
          </div>

          <button
            onClick={handleToggleConfigure}
            className={`px-4 py-2.5 transition-colors label-xs flex items-center gap-2 w-fit cursor-pointer ${
              isConfiguring
                ? 'bg-white text-[#141414] border border-black/20 hover:bg-black/5'
                : 'bg-[#141414] text-white hover:bg-black/85'
            }`}
          >
            {isConfiguring ? <X size={14} /> : <Plus size={14} />}
            <span>{isConfiguring ? 'CLOSE SELECTION' : 'CONFIGURE NEW ALERT'}</span>
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-900 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-700" />
              <span>{feedbackNotice}</span>
            </div>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Expandable Manual Alert Configuration Section */}
        {isConfiguring && (
          <div className="mb-12 p-6 sm:p-8 bg-white border border-black/15 shadow-xs animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-black/10 gap-2">
              <div>
                <div className="label-xs text-[#8e8e8e]">STEP 1 OF 1 — SELECT REPERTOIRE TITLE</div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414]">
                  UPCOMING THEATRICAL REPERTOIRE
                </h2>
              </div>
              <span className="label-mono text-[11px] text-[#8e8e8e]">
                {upcomingMovies.length} TITLES AVAILABLE FOR MONITORING
              </span>
            </div>

            <p className="text-xs text-[#8e8e8e] mb-6 leading-relaxed max-w-2xl">
              Select any upcoming title below. You can assign your alert to a specific cinema venue (e.g. AGS Cinemas, SPI Palazzo, PVR ICON) or monitor all theatres across Chennai.
            </p>

            {upcomingMovies.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[#8e8e8e]">
                LOADING UPCOMING REPERTOIRE...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMovies.map((movie) => {
                  const movieIdStr = String(movie.id);
                  const currTheatre = selectedTheatres[movieIdStr] || 'Any Theatre';
                  const currFormat = selectedFormats[movieIdStr] || 'Any Format';

                  const hasAlert = activeAlerts.some((a) => {
                    const matchTitle = a.movieTitle?.trim().toLowerCase() === movie.title.trim().toLowerCase();
                    const aTheatre = a.theaterName ? a.theaterName.trim().toLowerCase() : null;
                    const cTheatre = currTheatre === 'Any Theatre' ? null : currTheatre.trim().toLowerCase();
                    return matchTitle && aTheatre === cTheatre;
                  });

                  return (
                    <div
                      key={movie.id}
                      className="border border-black/[0.1] bg-[#fafafa] flex flex-col justify-between p-4 hover:border-black/30 transition-all"
                    >
                      <div>
                        {/* Top: Poster and Movie Details */}
                        <div className="flex gap-3 mb-4">
                          <img
                            src={movie.posterUrl || '/posters/batman.jpg'}
                            alt={movie.title}
                            className="w-20 h-28 object-cover border border-black/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="label-mono text-[9px] px-1.5 py-0.5 bg-black/[0.06] text-[#141414] font-semibold uppercase">
                              {movie.language}
                            </span>
                            <h3 className="font-bold text-sm uppercase tracking-tight text-[#141414] mt-1 line-clamp-2">
                              {movie.title}
                            </h3>
                            <div className="text-[11px] text-[#8e8e8e] mt-1 flex items-center gap-1 font-mono">
                              <Calendar size={11} />
                              <span>{movie.releaseDate || 'Upcoming 2026'}</span>
                            </div>
                            <div className="text-[10px] text-[#8e8e8e] mt-1 truncate">
                              {Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Drama'}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Theatre & Format Dropdowns */}
                        <div className="space-y-3 pt-3 border-t border-black/[0.08]">
                          <div>
                            <label className="label-xs text-[#8e8e8e] flex items-center gap-1 mb-1">
                              <MapPin size={11} />
                              <span>CINEMA THEATRE</span>
                            </label>
                            <select
                              value={currTheatre}
                              onChange={(e) =>
                                setSelectedTheatres({ ...selectedTheatres, [movieIdStr]: e.target.value })
                              }
                              className="w-full text-[11px] font-mono uppercase bg-white border border-black/15 p-2 outline-hidden cursor-pointer"
                            >
                              <option value="Any Theatre">ANY THEATRE (ALL CHENNAI)</option>
                              {theatres.map((t) => (
                                <option key={t.id} value={t.name}>
                                  {t.name} ({t.location || t.city})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="label-xs text-[#8e8e8e] flex items-center gap-1 mb-1">
                              <Layers size={11} />
                              <span>FORMAT PREFERENCE</span>
                            </label>
                            <select
                              value={currFormat}
                              onChange={(e) =>
                                setSelectedFormats({ ...selectedFormats, [movieIdStr]: e.target.value })
                              }
                              className="w-full text-[11px] font-mono uppercase bg-white border border-black/15 p-2 outline-hidden cursor-pointer"
                            >
                              <option value="Any Format">ANY FORMAT</option>
                              <option value="IMAX">IMAX 3D</option>
                              <option value="4DX">4DX</option>
                              <option value="DOLBY">DOLBY ATMOS</option>
                              <option value="STANDARD">STANDARD</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Button */}
                      <div className="mt-4 pt-3 border-t border-black/[0.08]">
                        {hasAlert ? (
                          <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 label-xs font-semibold flex items-center justify-center gap-1.5">
                            <Check size={13} />
                            <span>MONITORED FOR THIS VENUE</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateAlert(movie)}
                            disabled={subscribingId === movieIdStr}
                            className="w-full py-2.5 bg-[#141414] text-white hover:bg-black/85 transition-colors label-xs flex items-center justify-center gap-2 cursor-pointer font-medium disabled:opacity-50"
                          >
                            <Bell size={13} />
                            <span>
                              {subscribingId === movieIdStr ? 'REGISTERING...' : 'SET RELEASE ALERT'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Informative Note */}
        <p className="text-xs md:text-sm text-[#8e8e8e] max-w-2xl mb-8 leading-relaxed">
          Active alerts continuously check distributor showtimes every 3 minutes. When ticketing commences, an instant notification is triggered and marked ready for booking.
        </p>

        {/* Active Alerts List */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#8e8e8e]">
            LOADING YOUR SUBSCRIPTION REGISTRY...
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-black/[0.08]">
            <Bell size={24} className="mx-auto text-[#8e8e8e] mb-3" />
            <h3 className="text-base font-medium uppercase mb-2">No active release alerts</h3>
            <p className="text-xs text-[#8e8e8e] mb-6 max-w-sm mx-auto">
              You haven't set any release alerts yet. Click the button above to configure notifications for upcoming titles.
            </p>
            <button
              onClick={handleToggleConfigure}
              className="px-5 py-2.5 bg-[#141414] text-white label-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={13} />
              <span>CONFIGURE NEW ALERT</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const isTicketsOpen = alert.status === 'TICKETS_OPEN' || (alert.status as any) === 'TRIGGERED';

              return (
                <div
                  key={alert.id}
                  className={`p-5 sm:p-6 bg-white border transition-all ${
                    isTicketsOpen
                      ? 'border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/10'
                      : 'border-black/[0.08]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Poster + Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={alert.moviePoster}
                        alt={alert.movieTitle}
                        className="w-16 h-22 object-cover border border-black/10 shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`label-mono text-[9px] px-1.5 py-0.5 uppercase font-semibold ${
                              isTicketsOpen
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-black/[0.05] text-[#8e8e8e]'
                            }`}
                          >
                            {isTicketsOpen ? 'TICKETS OPEN' : 'MONITORING RELEASE'}
                          </span>

                          {/* Venue Preference Badge */}
                          <span className="label-mono text-[9px] px-1.5 py-0.5 bg-black/[0.04] text-[#141414] font-medium flex items-center gap-1 border border-black/[0.08]">
                            <MapPin size={10} />
                            <span>{alert.theaterName || 'ANY THEATRE IN CHENNAI'}</span>
                          </span>

                          {alert.screenType && (
                            <span className="label-mono text-[9px] px-1.5 py-0.5 bg-black/[0.04] text-[#8e8e8e] border border-black/[0.08]">
                              {alert.screenType}
                            </span>
                          )}
                        </div>

                        <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-[#141414]">
                          {alert.movieTitle}
                        </h2>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#8e8e8e] mt-1.5 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Release: {alert.releaseDate}</span>
                          </span>
                          <span>
                            Subscribed on {new Date(alert.subscribedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isTicketsOpen ? (
                        <button
                          onClick={() => handleBookNow(alert)}
                          className="px-4 py-2.5 bg-[#141414] text-white hover:bg-black/85 transition-colors label-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Ticket size={13} />
                          <span>BOOK SHOWTIMES NOW</span>
                        </button>
                      ) : (
                        <div className="px-3 py-2 bg-black/[0.03] text-[10px] font-mono text-[#8e8e8e] border border-black/[0.05]">
                          Awaiting distributor schedule
                        </div>
                      )}

                      <button
                        onClick={() => setCancelModalAlert(alert)}
                        className="p-2.5 text-[#8e8e8e] hover:text-red-600 hover:bg-black/5 transition-colors cursor-pointer"
                        title="Cancel subscription"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Subscription Cancellation */}
      {cancelModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-black/10 p-6 max-w-sm w-full animate-fadeIn">
            <h3 className="label-xs text-[#8e8e8e] mb-2">CANCEL SUBSCRIPTION</h3>
            <p className="text-sm font-medium mb-4">
              Are you sure you wish to cancel your release alert for{' '}
              <span className="font-bold uppercase">{cancelModalAlert.movieTitle}</span>
              {cancelModalAlert.theaterName ? ` at ${cancelModalAlert.theaterName}` : ''}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalAlert(null)}
                className="px-3 py-2 text-xs border border-black/15 hover:bg-black/5 cursor-pointer"
              >
                KEEP ALERT
              </button>
              <button
                onClick={() => handleCancelAlert(cancelModalAlert)}
                className="px-3 py-2 text-xs bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                YES, CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
