import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Booking, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, ChevronRight, XCircle } from 'lucide-react';

interface BookingsPageProps {
  user: User | null;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const email = user?.email || 'adamgoya0810@gmail.com';
      const data = await api.getBookings(email);
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter((b) => {
    if (activeTab === 'CANCELLED') {
      return b.status === 'CANCELLED';
    }
    if (b.status === 'CANCELLED') return false;

    if (activeTab === 'UPCOMING') {
      return b.date >= today;
    }
    if (activeTab === 'PAST') {
      return b.date < today;
    }
    return true;
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fafafa] text-[#141414] px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-black/[0.08] gap-4">
          <div>
            <div className="label-xs text-[#8e8e8e] mb-2">ARCHIVE & PASSES</div>
            <h1 className="text-3xl md:text-5xl font-normal tracking-tight uppercase leading-none">
              MY BOOKINGS
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5">
            {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 label-xs border transition-all ${
                  activeTab === tab
                    ? 'bg-[#141414] text-white border-[#141414]'
                    : 'bg-white text-[#141414] border-black/[0.08] hover:border-black/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List of Bookings */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-[#8e8e8e]">
            RETRIEVING RESERVATION ARCHIVES...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-black/[0.08]">
            <Ticket size={24} className="mx-auto text-[#8e8e8e] mb-3" />
            <h3 className="text-base font-medium uppercase mb-2">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-xs text-[#8e8e8e] mb-6 max-w-sm mx-auto">
              Your confirmed digital cinema passes will appear here once booked.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-5 py-2.5 bg-[#141414] text-white label-xs"
            >
              EXPLORE SCREENINGS
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                onClick={() => navigate(`/bookings/${booking.bookingReference}`)}
                className="group p-5 sm:p-6 bg-white border border-black/[0.08] hover:border-black/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Poster + Details */}
                <div className="flex items-center gap-4">
                  <img
                    src={booking.moviePoster}
                    alt={booking.movieTitle}
                    className="w-16 h-22 object-cover border border-black/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="label-mono text-[10px] text-[#8e8e8e] font-semibold">
                        {booking.bookingReference}
                      </span>
                      <span className="text-[#8e8e8e]">•</span>
                      <span
                        className={`label-mono text-[9px] px-1.5 py-0.5 uppercase ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-black/[0.06] text-[#141414]'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold uppercase tracking-tight text-[#141414] group-hover:underline">
                      {booking.movieTitle}
                    </h2>

                    <div className="text-xs text-[#8e8e8e] mt-1 flex flex-wrap items-center gap-3">
                      <span>{booking.theatreName}</span>
                      <span>•</span>
                      <span>{booking.screenName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#141414] mt-2 font-mono">
                      <span>{booking.date} at {booking.time}</span>
                      <span>•</span>
                      <span>Seats: {booking.seatIds.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & View Pass */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-black/[0.06] shrink-0">
                  <div className="text-lg font-mono font-normal">
                    ₹{booking.totalAmount}
                  </div>
                  <div className="label-xs text-[10px] text-[#8e8e8e] group-hover:text-[#141414] flex items-center gap-1 mt-1">
                    <span>VIEW DIGITAL PASS</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
