import React, { useState, useEffect, useCallback } from 'react';
import { Showtime, Seat, SeatHoldResponse, Booking, User } from '../../types';
import { api } from '../../services/api';
import { Clock, ShieldAlert, CheckCircle, ArrowLeft, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeatBookingViewProps {
  showtime: Showtime;
  movieTitle: string;
  theatreName: string;
  user: User | null;
  onBack: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onOpenAuthModal: () => void;
}

export const SeatBookingView: React.FC<SeatBookingViewProps> = ({
  showtime,
  movieTitle,
  theatreName,
  user,
  onBack,
  onBookingSuccess,
  onOpenAuthModal,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Seat hold state
  const [holdData, setHoldData] = useState<SeatHoldResponse | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(0);
  const [holdingInProgress, setHoldingInProgress] = useState(false);
  const [confirmingBooking, setConfirmingBooking] = useState(false);

  // Guest details if not logged in
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');

  // Load seats for showtime
  const loadSeats = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getShowtimeSeats(showtime.id);
      setSeats(data.seats);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load cinema layout.');
      setLoading(false);
    }
  }, [showtime.id]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  // Seat hold countdown timer
  useEffect(() => {
    if (!holdData) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expires = new Date(holdData.expiresAt).getTime();
      const diffSec = Math.max(0, Math.floor((expires - now) / 1000));
      setHoldSecondsRemaining(diffSec);

      if (diffSec <= 0) {
        clearInterval(interval);
        setHoldData(null);
        setErrorMsg('The 5-minute reservation timer has expired. Your held seats have been released.');
        loadSeats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdData, loadSeats]);

  // Clean up hold on unmount if not converted to booking
  useEffect(() => {
    return () => {
      if (holdData?.holdToken) {
        api.releaseHold(holdData.holdToken).catch(() => {});
      }
    };
  }, [holdData]);

  // Toggle seat selection
  const handleToggleSeat = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'held') return;
    if (holdData) {
      // If already held, user needs to release hold to change selection
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('Maximum 8 tickets allowed per reservation.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.id]);
    }
  };

  // Step 1: Create 5-minute Seat Hold
  const handleHoldSeats = async () => {
    if (selectedSeatIds.length === 0) return;
    try {
      setHoldingInProgress(true);
      setErrorMsg(null);
      const email = user?.email || guestEmail || 'guest@cinema.internal';
      const result = await api.createHold(showtime.id, selectedSeatIds, email);
      setHoldData(result);
      setHoldSecondsRemaining(result.expiresInSeconds);
      setHoldingInProgress(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Selected seats could not be held. Refreshing layout...');
      setHoldingInProgress(false);
      loadSeats();
    }
  };

  // Step 1b: Release Hold
  const handleReleaseHold = async () => {
    if (!holdData) return;
    try {
      await api.releaseHold(holdData.holdToken);
      setHoldData(null);
      loadSeats();
    } catch (err) {
      console.error(err);
    }
  };

  // Step 2: Confirm Booking
  const handleConfirmBooking = async () => {
    if (!holdData) return;
    try {
      setConfirmingBooking(true);
      setErrorMsg(null);
      const finalName = user?.name || guestName || 'Patron';
      const finalEmail = user?.email || guestEmail || 'patron@cinema.internal';

      const booking = await api.confirmBooking(holdData.holdToken, finalName, finalEmail);
      setConfirmingBooking(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onBookingSuccess(booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking confirmation failed.');
      setConfirmingBooking(false);
    }
  };

  // Calculate pricing
  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // Group seats by row for 2D layout
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#141414] pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back and Showtime Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-black/[0.08] gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 label-xs text-[#141414] hover:opacity-70 transition-opacity w-fit"
          >
            <ArrowLeft size={16} />
            <span>RETURN TO SHOWTIMES</span>
          </button>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold uppercase tracking-wider">{movieTitle}</span>
            <span className="text-[#8e8e8e]">•</span>
            <span className="text-[#8e8e8e]">{theatreName}</span>
            <span className="text-[#8e8e8e]">•</span>
            <span className="label-mono px-2 py-0.5 bg-black/[0.05]">{showtime.format}</span>
            <span className="label-mono text-[#8e8e8e]">{showtime.date} at {showtime.time}</span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="label-xs font-bold underline">
              DISMISS
            </button>
          </div>
        )}

        {/* Active Hold Countdown Banner */}
        {holdData && (
          <div className="mb-8 p-4 bg-[#141414] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-amber-400" />
              <div>
                <span className="label-xs text-white/70 block">SEAT RESERVATION TIMER ACTIVE</span>
                <span className="text-sm font-medium">
                  {selectedSeatIds.join(', ')} held for your booking
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="label-mono text-xl font-bold tabular-nums text-amber-400">
                {Math.floor(holdSecondsRemaining / 60)}:
                {String(holdSecondsRemaining % 60).padStart(2, '0')}
              </div>
              <button
                onClick={handleReleaseHold}
                className="px-3 py-1 text-[10px] uppercase font-mono border border-white/20 hover:bg-white/10"
              >
                RELEASE
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main 2D Seating Layout (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-black/[0.08] p-6 sm:p-8">
            {/* Screen Indicator with subtle curve */}
            <div className="mb-12">
              <div className="w-full h-2 bg-gradient-to-r from-transparent via-black/20 to-transparent rounded-t-full mb-2" />
              <div className="text-center label-xs text-[10px] tracking-[0.2em] text-[#8e8e8e]">
                THEATRICAL SCREEN ({showtime.screenName})
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center font-mono text-xs text-[#8e8e8e]">
                INITIALIZING THEATRE SEATING GRID...
              </div>
            ) : (
              <div className="space-y-3 overflow-x-auto pb-4">
                {rows.map((rowLetter) => {
                  const rowSeats = seats.filter((s) => s.row === rowLetter);
                  const isVip = rowLetter === 'A' || rowLetter === 'B';

                  return (
                    <div key={rowLetter} className="flex items-center justify-center gap-1.5 sm:gap-2">
                      {/* Row Label */}
                      <span className="w-4 text-center label-mono text-[10px] text-[#8e8e8e] font-semibold">
                        {rowLetter}
                      </span>

                      {/* Left Block (Seats 1-6) */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {rowSeats.slice(0, 6).map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isHeld = seat.status === 'held' && !isSelected;
                          const isBooked = seat.status === 'booked';

                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleToggleSeat(seat)}
                              disabled={isBooked || (isHeld && !isSelected) || (holdData !== null && !isSelected)}
                              title={`Seat ${seat.id} (${seat.tier.toUpperCase()}) - ₹${seat.price}`}
                              className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] font-mono flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[#141414] text-white border border-[#141414] font-bold shadow-xs'
                                  : isHeld
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                                  : isBooked
                                  ? 'bg-black/[0.06] text-black/20 border border-black/[0.04] cursor-not-allowed'
                                  : 'bg-[#fafafa] text-[#141414] border border-black/20 hover:border-black hover:bg-black/5'
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      {/* Center Aisle */}
                      <div className="w-6 sm:w-8 text-center text-[8px] text-black/20 font-mono">
                        |
                      </div>

                      {/* Right Block (Seats 7-12) */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {rowSeats.slice(6, 12).map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isHeld = seat.status === 'held' && !isSelected;
                          const isBooked = seat.status === 'booked';

                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleToggleSeat(seat)}
                              disabled={isBooked || (isHeld && !isSelected) || (holdData !== null && !isSelected)}
                              title={`Seat ${seat.id} (${seat.tier.toUpperCase()}) - ₹${seat.price}`}
                              className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] font-mono flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-[#141414] text-white border border-[#141414] font-bold shadow-xs'
                                  : isHeld
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
                                  : isBooked
                                  ? 'bg-black/[0.06] text-black/20 border border-black/[0.04] cursor-not-allowed'
                                  : 'bg-[#fafafa] text-[#141414] border border-black/20 hover:border-black hover:bg-black/5'
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tier badge on hover */}
                      <span className="w-6 text-[8px] label-mono text-[#8e8e8e]">
                        {isVip ? 'VIP' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Restrained Monochrome Legend as specified */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 mt-6 border-t border-black/[0.06] text-[11px] text-[#8e8e8e]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#fafafa] border border-black/20" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#141414] text-white text-[9px] flex items-center justify-center font-bold" />
                <span className="text-[#141414] font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-100 border border-amber-300" />
                <span>Held (Reserved)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black/[0.06] border border-black/[0.04]" />
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* Right Summary & Booking Actions Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-black/[0.08] p-6">
              <h3 className="label-xs text-[#8e8e8e] mb-4">RESERVATION SUMMARY</h3>

              <div className="space-y-3 pb-4 mb-4 border-b border-black/[0.06] text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8e8e8e]">Screening</span>
                  <span className="font-medium text-right">{showtime.time} • {showtime.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8e8e8e]">Selected Seats</span>
                  <span className="font-mono font-medium">
                    {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'None chosen'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8e8e8e]">Ticket Count</span>
                  <span className="font-mono">{selectedSeatIds.length}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-sm font-medium">Total Payable</span>
                <span className="text-2xl font-normal font-mono">₹{totalAmount}</span>
              </div>

              {/* Customer Contact input if not logged in */}
              {!user && !holdData && (
                <div className="space-y-3 mb-6 pt-3 border-t border-black/[0.06]">
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">GUEST NAME</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 text-xs border border-black/15 bg-[#fafafa] outline-hidden focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="label-xs text-[#8e8e8e] block mb-1">EMAIL RECEIPT</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 text-xs border border-black/15 bg-[#fafafa] outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              )}

              {/* Primary Actions based on hold state */}
              {!holdData ? (
                <button
                  onClick={handleHoldSeats}
                  disabled={selectedSeatIds.length === 0 || holdingInProgress}
                  className="w-full py-3.5 bg-[#141414] text-white label-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/85 transition-colors flex items-center justify-center gap-2"
                >
                  <Ticket size={14} />
                  <span>
                    {holdingInProgress ? 'HOLDING SEATS...' : `HOLD SEATS (5 MIN)`}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  disabled={confirmingBooking}
                  className="w-full py-4 bg-[#141414] text-white label-xs hover:bg-black/90 transition-colors flex items-center justify-center gap-2 shadow-sm font-semibold tracking-wider"
                >
                  <CheckCircle size={15} />
                  <span>
                    {confirmingBooking ? 'CONFIRMING WITH CINEMA...' : 'CONFIRM BOOKING'}
                  </span>
                </button>
              )}

              <p className="text-[10px] text-[#8e8e8e] text-center mt-3 leading-normal">
                Held seats are exclusively reserved for 5 minutes. No cancellation fees within 2 hours of showtime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
