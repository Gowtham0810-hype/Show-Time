export type MovieLanguage = 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu' | 'Kannada';

export type MovieGenre = 'Action' | 'Drama' | 'Sci-Fi' | 'Thriller' | 'Romance' | 'Adventure' | 'Epic' | 'Crime';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  language: MovieLanguage;
  genres: MovieGenre[];
  runtimeMinutes: number;
  releaseDate: string; // YYYY-MM-DD
  certification: 'U' | 'UA' | 'A' | 'PG-13' | 'R';
  rating?: number; // e.g. 8.8
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  stillImages: string[];
  isNowShowing: boolean;
  isUpcoming: boolean;
  director?: string;
  cast?: string[];
}

export interface Screen {
  id: string;
  name: string;
  type: 'IMAX Laser' | 'Dolby Atmos 4K' | 'Standard Screen' | 'ScreenX';
  capacity: number;
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  screens: Screen[];
}

export interface Showtime {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24hr)
  format: '2D' | '3D' | 'IMAX 3D' | '4DX';
  price: number;
  availableSeatsCount: number;
  totalSeatsCount: number;
}

export type SeatStatus = 'available' | 'selected' | 'held' | 'booked';
export type SeatTier = 'standard' | 'premium' | 'vip';

export interface Seat {
  id: string; // e.g. 'A-1'
  row: string;
  number: number;
  tier: SeatTier;
  price: number;
  status: SeatStatus;
}

export interface SeatHoldResponse {
  holdToken: string;
  showtimeId: string;
  seatIds: string[];
  expiresAt: string; // ISO String
  expiresInSeconds: number;
  totalAmount: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theatreId: string;
  theatreName: string;
  theatreLocation: string;
  screenName: string;
  showtimeId: string;
  date: string;
  time: string;
  format: string;
  seatIds: string[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

export interface ReleaseAlert {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theaterName?: string;
  screenType?: string;
  language: string;
  releaseDate: string;
  subscribedAt: string;
  status: 'PENDING' | 'TICKETS_OPEN' | 'CANCELLED';
  userEmail: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  token: string;
}

export interface ChatStructuredAction {
  type: string;
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredAction?: ChatStructuredAction;
}
