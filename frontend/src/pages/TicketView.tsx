import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Booking } from '../types';
import { ArrowLeft, Printer, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export const TicketView: React.FC = () => {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      if (!ref) return;
      try {
        setLoading(true);
        const data = await api.getBookingByRef(ref);
        setBooking(data);
        setLoading(false);
      } catch (err: any) {
        setErrorMsg(err.message || 'Booking reference not found.');
        setLoading(false);
      }
    }
    fetchTicket();
  }, [ref]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    try {
      setCancelling(true);
      const res = await api.cancelBooking(booking.bookingReference);
      setBooking(res.booking);
      setCancelling(false);
      setShowCancelModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel reservation.');
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[#fafafa] text-center font-mono text-xs text-[#8e8e8e]">
        VALIDATING THEATRICAL PASS...
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="pt-32 min-h-screen bg-[#fafafa] px-6 text-center">
        <h2 className="text-xl font-medium uppercase mb-2">Ticket Not Found</h2>
        <p className="text-xs text-[#8e8e8e] mb-6">{errorMsg || 'Could not locate reservation.'}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-[#141414] text-white label-xs"
        >
          RETURN TO BOOKINGS
        </button>
      </div>
    );
  }

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fafafa] text-[#141414] px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Top actions */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-black/[0.08]">
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 label-xs text-[#141414] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={16} />
            <span>MY BOOKINGS</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 label-xs text-[#8e8e8e] hover:text-[#141414]"
          >
            <Printer size={14} />
            <span>PRINT PASS</span>
          </button>
        </div>

        {/* Minimal Digital Movie Ticket as specified in Section 11 */}
        <div className="bg-white border border-black/[0.12] p-8 sm:p-10 relative overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-black/[0.08] mb-6">
            <div>
              <div className="label-xs text-[10px] text-[#8e8e8e]">CINEMA PASS</div>
              <div className="label-mono text-sm font-bold tracking-wider mt-0.5">
                {booking.bookingReference}
              </div>
            </div>

            <span
              className={`px-2.5 py-1 label-mono text-[10px] font-semibold uppercase ${
                isCancelled
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-black text-white'
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Movie Title */}
          <div className="mb-6">
            <span className="label-xs text-[#8e8e8e]">FEATURE PRESENTATION</span>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#141414] mt-1">
              {booking.movieTitle}
            </h1>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 pb-6 mb-6 border-b border-black/[0.06] text-xs">
            <div>
              <span className="label-xs text-[#8e8e8e] block mb-1">VENUE</span>
              <div className="font-semibold text-[#141414]">{booking.theatreName}</div>
              <div className="text-[11px] text-[#8e8e8e]">{booking.theatreLocation}</div>
            </div>

            <div>
              <span className="label-xs text-[#8e8e8e] block mb-1">AUDITORIUM</span>
              <div className="font-semibold text-[#141414]">{booking.screenName}</div>
              <div className="text-[11px] text-[#8e8e8e] font-mono">{booking.format}</div>
            </div>

            <div>
              <span className="label-xs text-[#8e8e8e] block mb-1">DATE & TIME</span>
              <div className="font-semibold text-[#141414]">{booking.date}</div>
              <div className="text-[11px] text-[#8e8e8e] font-mono">{booking.time} HRS</div>
            </div>

            <div>
              <span className="label-xs text-[#8e8e8e] block mb-1">ASSIGNED SEATS</span>
              <div className="font-mono font-bold text-sm text-[#141414]">
                {booking.seatIds.join(', ')}
              </div>
              <div className="text-[10px] text-[#8e8e8e]">
                {booking.seatIds.length} {booking.seatIds.length === 1 ? 'Seat' : 'Seats'}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Total & Guest */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-black/[0.06]">
            <div>
              <span className="label-xs text-[#8e8e8e] block mb-0.5">ISSUED TO</span>
              <span className="text-xs font-medium">{booking.customerName}</span>
            </div>

            <div className="text-right">
              <span className="label-xs text-[#8e8e8e] block mb-0.5">TOTAL PAID</span>
              <span className="text-xl font-mono font-normal">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Minimal Barcode Identifier representation */}
          <div className="text-center pt-2">
            <div className="h-10 w-full flex items-center justify-center gap-1.5 opacity-60">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-black"
                  style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px' }}
                />
              ))}
            </div>
            <div className="label-mono text-[9px] text-[#8e8e8e] mt-2 uppercase tracking-widest">
              VALID FOR ONE-TIME ADMISSION • ENTRY CLOSES 15 MIN AFTER COMMENCEMENT
            </div>
          </div>
        </div>

        {/* Cancellation Section */}
        {!isCancelled && (
          <div className="mt-8 pt-6 border-t border-black/[0.08] flex items-center justify-between">
            <span className="text-xs text-[#8e8e8e]">
              Need to modify your plans? Cancellations are permitted prior to showtime.
            </span>
            <button
              onClick={() => setShowCancelModal(true)}
              className="label-xs text-red-600 hover:text-red-700 underline shrink-0 ml-4"
            >
              CANCEL RESERVATION
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-black/10 p-6 max-w-sm w-full animate-fadeIn">
            <h3 className="label-xs text-red-600 mb-2">CONFIRM CANCELLATION</h3>
            <p className="text-sm font-medium mb-4 leading-normal">
              Cancel reservation {booking.bookingReference} for {booking.movieTitle}? Your seats ({booking.seatIds.join(', ')}) will be returned to public availability.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-2 text-xs border border-black/15 hover:bg-black/5"
              >
                KEEP RESERVATION
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-3 py-2 text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'CANCELLING...' : 'CONFIRM CANCEL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
