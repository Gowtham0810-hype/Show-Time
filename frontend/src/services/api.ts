import { Movie, Theatre, Showtime, Seat, SeatHoldResponse, Booking, ReleaseAlert, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not configured');
}

const API_BASE = `${API_BASE_URL}/api`;

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('cinema_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem('cinema_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('cinema_user');
  }
}

function getAuthHeader(): Record<string, string> {
  const user = getStoredUser();
  if (user?.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const data = await response.json();
        if (data.error) errorMsg = data.error;
        else if (data.message) errorMsg = data.message;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data as T;
    }
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: User }> => {
    const res = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const rawUser = res.user || res;
    const user: User = {
      id: String(rawUser.id),
      name: rawUser.name || rawUser.fullName || email.split('@')[0],
      email: rawUser.email || email,
      role: rawUser.role || 'USER',
      token: res.token || rawUser.token || ''
    };
    setStoredUser(user);
    return { user };
  },

  register: async (name: string, email: string, password: string): Promise<{ user: User }> => {
    const res = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    const rawUser = res.user || res;
    const user: User = {
      id: String(rawUser.id),
      name: rawUser.name || rawUser.fullName || name,
      email: rawUser.email || email,
      role: rawUser.role || 'USER',
      token: res.token || rawUser.token || ''
    };
    setStoredUser(user);
    return { user };
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const stored = getStoredUser();
      const rawUser = await request<any>('/auth/me');
      if (!rawUser) return stored;
      const user: User = {
        id: String(rawUser.id),
        name: rawUser.name || rawUser.fullName || (stored?.name ?? ''),
        email: rawUser.email || (stored?.email ?? ''),
        role: rawUser.role || (stored?.role ?? 'USER'),
        token: stored?.token || rawUser.token || ''
      };
      setStoredUser(user);
      return user;
    } catch {
      return getStoredUser();
    }
  },

  logout: () => {
    setStoredUser(null);
  },

  // Movies
  getMovies: async (params?: { language?: string; genre?: string; showing?: boolean; upcoming?: boolean; search?: string }): Promise<Movie[]> => {
    const query = new URLSearchParams();
    if (params?.language) query.set('language', params.language);
    if (params?.genre) query.set('genre', params.genre);
    if (params?.showing !== undefined) query.set('showing', String(params.showing));
    if (params?.upcoming !== undefined) query.set('upcoming', String(params.upcoming));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return request<Movie[]>(`/movies${qs ? `?${qs}` : ''}`);
  },

  getMovieById: async (id: string): Promise<Movie> => {
    return request<Movie>(`/movies/${id}`);
  },

  createMovie: async (movieData: Partial<Movie>): Promise<Movie> => {
    return request<Movie>('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  },

  deleteMovie: async (id: string): Promise<{ message: string; movie?: Movie }> => {
    return request<{ message: string; movie?: Movie }>(`/movies/${id}`, {
      method: 'DELETE',
    });
  },

  uploadPoster: async (data: string, filename?: string): Promise<{ posterUrl: string }> => {
    return request<{ posterUrl: string }>('/upload-poster', {
      method: 'POST',
      body: JSON.stringify({ data, filename }),
    });
  },

  getAvailablePosters: async (): Promise<string[]> => {
    return request<string[]>('/admin/available-posters');
  },

  // Theatres
  getTheatres: async (): Promise<Theatre[]> => {
    return request<Theatre[]>('/theatres');
  },

  createTheatre: async (theatreData: any): Promise<Theatre> => {
    return request<Theatre>('/theatres', {
      method: 'POST',
      body: JSON.stringify(theatreData),
    });
  },

  deleteTheatre: async (id: string): Promise<{ message: string; theatre?: Theatre }> => {
    return request<{ message: string; theatre?: Theatre }>(`/theatres/${id}`, {
      method: 'DELETE',
    });
  },

  // Showtimes
  getShowtimes: async (params?: { movieId?: string; theatreId?: string; date?: string }): Promise<Showtime[]> => {
    const query = new URLSearchParams();
    if (params?.movieId) query.set('movieId', params.movieId);
    if (params?.theatreId) query.set('theatreId', params.theatreId);
    if (params?.date) query.set('date', params.date);

    const qs = query.toString();
    return request<Showtime[]>(`/showtimes${qs ? `?${qs}` : ''}`);
  },

  createShowtime: async (data: any): Promise<Showtime> => {
    return request<Showtime>('/showtimes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteShowtime: async (id: string): Promise<{ message: string; showtime?: Showtime }> => {
    return request<{ message: string; showtime?: Showtime }>(`/showtimes/${id}`, {
      method: 'DELETE',
    });
  },

  // Seats for a showtime
  getShowtimeSeats: async (showtimeId: string): Promise<{ showtime: Showtime; seats: Seat[] }> => {
    return request<{ showtime: Showtime; seats: Seat[] }>(`/showtimes/${showtimeId}/seats`);
  },

  // Holds
  createHold: async (showtimeId: string, seatIds: string[], userEmail?: string): Promise<SeatHoldResponse> => {
    return request<SeatHoldResponse>('/holds', {
      method: 'POST',
      body: JSON.stringify({ showtimeId, seatIds, userEmail }),
    });
  },

  releaseHold: async (token: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/holds/${token}`, {
      method: 'DELETE',
    });
  },

  // Bookings
  confirmBooking: async (holdToken: string, customerName?: string, customerEmail?: string): Promise<Booking> => {
    return request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ holdToken, customerName, customerEmail }),
    });
  },

  getBookings: async (email?: string): Promise<Booking[]> => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<Booking[]>(`/bookings${qs}`);
  },

  getBookingByRef: async (ref: string): Promise<Booking> => {
    return request<Booking>(`/bookings/${ref}`);
  },

  cancelBooking: async (ref: string): Promise<{ message: string; booking: Booking }> => {
    return request<{ message: string; booking: Booking }>(`/bookings/${ref}`, {
      method: 'DELETE',
    });
  },

  // Alerts
  getAlerts: async (email?: string): Promise<ReleaseAlert[]> => {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<ReleaseAlert[]>(`/alerts${qs}`);
  },

  createAlert: async (
    param1: string | { movieId?: string | number; movieTitle: string; theaterName?: string | null; screenType?: string | null; userEmail?: string; notes?: string },
    movieTitle?: string,
    userEmail?: string,
    notes?: string
  ): Promise<ReleaseAlert> => {
    let bodyObj: any;
    if (typeof param1 === 'object') {
      bodyObj = param1;
    } else {
      bodyObj = { movieId: param1, movieTitle, userEmail, notes };
    }
    return request<ReleaseAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(bodyObj),
    });
  },

  cancelAlert: async (id: string): Promise<{ message: string; alert: ReleaseAlert }> => {
    return request<{ message: string; alert: ReleaseAlert }>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Assistant Chat
  sendChatMessage: async (
    params: {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      message?: string;
      userEmail?: string;
      sessionId?: string | number;
      type?: 'TEXT' | 'ACTION';
      action?: string;
      payload?: any;
    } | Array<{ role: 'user' | 'assistant'; content: string }>,
    userEmail?: string
  ): Promise<{
    reply: string;
    message?: string;
    sessionId?: number | string;
    responseType?: string;
    payload?: any;
    structuredAction?: any;
  }> => {
    let body: any;
    if (Array.isArray(params)) {
      body = { messages: params, userEmail };
    } else {
      body = { ...params };
      if (!body.userEmail && userEmail) body.userEmail = userEmail;
    }

    return request<{
      reply: string;
      message?: string;
      sessionId?: number | string;
      responseType?: string;
      payload?: any;
      structuredAction?: any;
    }>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
