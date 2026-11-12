import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// Initial Movie Dataset with curated high quality cinema photography
interface MovieRecord {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  language: string;
  genres: string[];
  runtimeMinutes: number;
  releaseDate: string;
  certification: 'U' | 'UA' | 'A' | 'PG-13' | 'R';
  rating: number;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  stillImages: string[];
  isNowShowing: boolean;
  isUpcoming: boolean;
  director: string;
  cast: string[];
}

let movies: MovieRecord[] = [
  {
    id: 'mov-1',
    title: 'THE BATMAN',
    originalTitle: 'The Batman',
    slug: 'the-batman',
    language: 'English',
    genres: ['Action', 'Crime', 'Drama', 'Mystery'],
    runtimeMinutes: 176,
    releaseDate: '2026-03-04',
    certification: 'UA',
    rating: 8.5,
    synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    posterUrl: '/posters/batman.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'Colin Farrell']
  },
  {
    id: 'mov-2',
    title: 'DJANGO UNCHAINED',
    originalTitle: 'Django Unchained',
    slug: 'django-unchained',
    language: 'English',
    genres: ['Western', 'Action', 'Drama'],
    runtimeMinutes: 165,
    releaseDate: '2026-04-12',
    certification: 'A',
    rating: 8.5,
    synopsis: 'With the help of a German bounty hunter, a freed slave sets out across the American South to rescue his beloved wife from a brutal and sadistic Mississippi plantation owner.',
    posterUrl: '/posters/django-unchained.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Quentin Tarantino',
    cast: ['Jamie Foxx', 'Christoph Waltz', 'Leonardo DiCaprio', 'Kerry Washington', 'Samuel L. Jackson']
  },
  {
    id: 'mov-3',
    title: 'DUNE: PART TWO',
    originalTitle: 'Dune: Part Two',
    slug: 'dune-part-two',
    language: 'English',
    genres: ['Sci-Fi', 'Adventure', 'Epic'],
    runtimeMinutes: 166,
    releaseDate: '2026-03-01',
    certification: 'UA',
    rating: 8.9,
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the destiny of the universe.',
    posterUrl: '/posters/dune-part-two.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler']
  },
  {
    id: 'mov-4',
    title: 'GET OUT',
    originalTitle: 'Get Out',
    slug: 'get-out',
    language: 'English',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtimeMinutes: 104,
    releaseDate: '2026-02-24',
    certification: 'A',
    rating: 8.0,
    synopsis: 'A young African-American photographer visits his white girlfriend\'s secluded family estate for the weekend, where a series of increasingly disturbing discoveries pull him into an unimaginable nightmare.',
    posterUrl: '/posters/get-out.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Jordan Peele',
    cast: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford', 'Catherine Keener', 'Lil Rel Howery']
  },
  {
    id: 'mov-5',
    title: 'INCANTATION',
    originalTitle: '咒',
    slug: 'incantation',
    language: 'Mandarin',
    genres: ['Horror', 'Mystery', 'Found Footage'],
    runtimeMinutes: 110,
    releaseDate: '2026-07-08',
    certification: 'A',
    rating: 7.2,
    synopsis: 'Six years ago, Li Ronan broke a sacred religious taboo while exploring a hidden subterranean tunnel. Now, an ancient malevolent curse awakens to claim her young daughter.',
    posterUrl: '/posters/INCANTATION.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'Kevin Ko',
    cast: ['Tsai Hsuan-yen', 'Huang Sin-ting', 'Kao Ying-hsuan', 'Sean Lin']
  },
  {
    id: 'mov-6',
    title: 'MALIGNANT',
    originalTitle: 'Malignant',
    slug: 'malignant',
    language: 'English',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtimeMinutes: 111,
    releaseDate: '2026-08-20',
    certification: 'A',
    rating: 7.3,
    synopsis: 'Madison is paralyzed by shocking waking visions of gruesome murders, only to discover with horror that her nightmares are actually real-time crimes committed by a parasite from her past.',
    posterUrl: '/posters/malignant.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'James Wan',
    cast: ['Annabelle Wallis', 'Maddie Hasson', 'George Young', 'Michole Briana White']
  },
  {
    id: 'mov-7',
    title: 'MARTY SUPREME',
    originalTitle: 'Marty Supreme',
    slug: 'marty-supreme',
    language: 'English',
    genres: ['Drama', 'Sport', 'Biography'],
    runtimeMinutes: 135,
    releaseDate: '2026-11-20',
    certification: 'UA',
    rating: 8.6,
    synopsis: 'An electric, fast-paced period drama inspired by the legendary American table tennis champion Marty Reisman and his charismatic hustle through 1950s New York City.',
    posterUrl: '/posters/marty-supreme.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1533619043865-1c2e2f32ff2f?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'Josh Safdie',
    cast: ['Timothée Chalamet', 'Gwyneth Paltrow', 'Tyler the Creator', 'Odessa A\'zion', 'Kevin O\'Leary']
  },
  {
    id: 'mov-8',
    title: 'OBSESSION',
    originalTitle: 'Obsession',
    slug: 'obsession',
    language: 'English',
    genres: ['Drama', 'Mystery', 'Thriller'],
    runtimeMinutes: 108,
    releaseDate: '2026-10-15',
    certification: 'A',
    rating: 7.6,
    synopsis: 'Years after a devastating kidnapping claimed his family, a guilt-ridden architect travels to Florence and encounters a young woman who bears an uncanny resemblance to his late wife, plunging him into a web of deceit.',
    posterUrl: '/posters/OBSESSION.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'Brian De Palma',
    cast: ['Cliff Robertson', 'Geneviève Bujold', 'John Lithgow']
  },
  {
    id: 'mov-9',
    title: 'OPPENHEIMER',
    originalTitle: 'Oppenheimer',
    slug: 'oppenheimer',
    language: 'English',
    genres: ['Biography', 'Drama', 'History'],
    runtimeMinutes: 180,
    releaseDate: '2026-07-21',
    certification: 'UA',
    rating: 8.9,
    synopsis: 'The story of American theoretical physicist J. Robert Oppenheimer and his leadership of the Manhattan Project to develop the first nuclear weapons, confronting the profound moral weight of humanity\'s creation.',
    posterUrl: '/posters/oppenheimer.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh']
  },
  {
    id: 'mov-10',
    title: 'PARASITE',
    originalTitle: '기생충',
    slug: 'parasite',
    language: 'Korean',
    genres: ['Drama', 'Thriller', 'Dark Comedy'],
    runtimeMinutes: 132,
    releaseDate: '2026-05-30',
    certification: 'A',
    rating: 8.5,
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan when an unexpected visitor disrupts their delicate deception.',
    posterUrl: '/posters/parasite.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam']
  },
  {
    id: 'mov-11',
    title: 'SE7EN',
    originalTitle: 'Se7en',
    slug: 'se7en',
    language: 'English',
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    runtimeMinutes: 127,
    releaseDate: '2026-06-18',
    certification: 'A',
    rating: 8.6,
    synopsis: 'Two detectives—a retiring veteran and an impetuous rookie—hunt a meticulous serial killer whose heinous crimes are based on the seven deadly sins.',
    posterUrl: '/posters/se7en.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Morgan Freeman', 'Gwyneth Paltrow', 'Kevin Spacey', 'John C. McGinley']
  },
  {
    id: 'mov-12',
    title: 'SUPERMAN',
    originalTitle: 'Superman',
    slug: 'superman',
    language: 'English',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    runtimeMinutes: 140,
    releaseDate: '2026-07-11',
    certification: 'UA',
    rating: 8.8,
    synopsis: 'Superman reconciles his Kryptonian heritage with his adoptive human upbringing as Clark Kent in Smallville. Guided by human kindness, he stands as a beacon of hope in an increasingly cynical world.',
    posterUrl: '/posters/superman.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'James Gunn',
    cast: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult', 'Edi Gathegi', 'Nathan Fillion']
  },
  {
    id: 'mov-13',
    title: 'THE CONJURING: LAST RITES',
    originalTitle: 'The Conjuring: Last Rites',
    slug: 'the-conjuring-last-rites',
    language: 'English',
    genres: ['Horror', 'Mystery', 'Thriller'],
    runtimeMinutes: 115,
    releaseDate: '2026-09-05',
    certification: 'A',
    rating: 8.1,
    synopsis: 'Paranormal investigators Ed and Lorraine Warren undertake one final, deeply personal investigation as malevolent demonic forces push their spiritual fortitude and love to the ultimate edge.',
    posterUrl: '/posters/the-conjuring-last-rites.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: false,
    isUpcoming: true,
    director: 'Michael Chaves',
    cast: ['Patrick Wilson', 'Vera Farmiga', 'Mia Tomlinson', 'Ben Hardy']
  },
  {
    id: 'mov-14',
    title: 'WHIPLASH',
    originalTitle: 'Whiplash',
    slug: 'whiplash',
    language: 'English',
    genres: ['Drama', 'Music'],
    runtimeMinutes: 107,
    releaseDate: '2026-08-14',
    certification: 'UA',
    rating: 8.5,
    synopsis: 'A relentlessly ambitious jazz drummer enrolling at a prestigious music conservatory is pushed beyond the limits of sanity by an abusive instructor who uses fear and psychological warfare.',
    posterUrl: '/posters/Whiplash.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Damien Chazelle',
    cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser', 'Melissa Benoist']
  },
  {
    id: 'mov-15',
    title: 'THE WOLF OF WALL STREET',
    originalTitle: 'The Wolf of Wall Street',
    slug: 'the-wolf-of-wall-street',
    language: 'English',
    genres: ['Biography', 'Comedy', 'Crime'],
    runtimeMinutes: 180,
    releaseDate: '2026-04-20',
    certification: 'A',
    rating: 8.2,
    synopsis: 'The exhilarating and scandalous true story of Jordan Belfort, charting his meteoric rise to exorbitant wealth through pump-and-dump securities fraud and his precipitous fall into federal custody.',
    posterUrl: '/posters/wolf-of-wall-street.jpg',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: true,
    isUpcoming: false,
    director: 'Martin Scorsese',
    cast: ['Leonardo DiCaprio', 'Jonah Hill', 'Margot Robbie', 'Matthew McConaughey', 'Kyle Chandler']
  }
];

// Theatres
interface TheatreRecord {
  id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  screens: { id: string; name: string; type: string; capacity: number }[];
}

let theatres: TheatreRecord[] = [
  {
    id: 'th-1',
    name: 'SPI Palazzo Cinemas',
    location: 'Velachery',
    city: 'Chennai',
    address: 'Grand Square Mall, Velachery Bypass Rd, Chennai',
    screens: [
      { id: 'sc-1', name: 'Screen 1 (IMAX Laser)', type: 'IMAX Laser', capacity: 120 },
      { id: 'sc-2', name: 'Screen 2 (Dolby Atmos)', type: 'Dolby Atmos 4K', capacity: 100 },
      { id: 'sc-3', name: 'Screen 3 (Luxe Screen)', type: 'Standard Screen', capacity: 80 }
    ]
  },
  {
    id: 'th-2',
    name: 'PVR ICON Grand Galleria',
    location: 'Anna Nagar',
    city: 'Chennai',
    address: 'VR Mall, Jawaharlal Nehru Rd, Anna Nagar, Chennai',
    screens: [
      { id: 'sc-4', name: 'Audi 1 (4DX Experience)', type: '4DX', capacity: 96 },
      { id: 'sc-5', name: 'Audi 2 (P[XL] Laser)', type: 'Dolby Atmos 4K', capacity: 140 }
    ]
  },
  {
    id: 'th-3',
    name: 'AGS Cinemas',
    location: 'T. Nagar',
    city: 'Chennai',
    address: 'Bazullah Rd, Parthasarathi Puram, T. Nagar, Chennai',
    screens: [
      { id: 'sc-6', name: 'Main Screen 4K', type: 'Dolby Atmos 4K', capacity: 110 }
    ]
  }
];

// Showtimes generator for today and next 4 days
interface ShowtimeRecord {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  date: string;
  time: string;
  format: '2D' | '3D' | 'IMAX 3D' | '4DX';
  price: number;
  availableSeatsCount: number;
  totalSeatsCount: number;
}

const showtimes: ShowtimeRecord[] = [];

// Helper to format date YYYY-MM-DD
function getLocalDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const timeslots = ['10:30', '14:15', '18:00', '21:30'];
let stCount = 1;

// Seed showtimes for currently showing movies
for (const m of movies.filter(m => m.isNowShowing)) {
  for (let day = 0; day <= 4; day++) {
    const showDate = getLocalDateString(day);
    for (const t of theatres) {
      for (const sc of t.screens) {
        // pick 2 or 3 timeslots per screen
        const pickedSlots = timeslots.slice(0, 3);
        for (const slot of pickedSlots) {
          const isImax = sc.type.includes('IMAX');
          const is4DX = sc.type.includes('4DX');
          const format = isImax ? 'IMAX 3D' : (is4DX ? '4DX' : '2D');
          const price = isImax ? 380 : (is4DX ? 420 : 220);
          showtimes.push({
            id: `st-${stCount++}`,
            movieId: m.id,
            theatreId: t.id,
            screenId: sc.id,
            screenName: sc.name,
            date: showDate,
            time: slot,
            format,
            price,
            availableSeatsCount: sc.capacity - 18,
            totalSeatsCount: sc.capacity
          });
        }
      }
    }
  }
}

// Seat states per showtime: Map<showtimeId, Map<seatId, status>>
// Status: 'available' | 'booked' | 'held'
const bookedSeatsStore = new Map<string, Set<string>>();
// Pre-populate realistic booked seats for realism
for (const st of showtimes) {
  const booked = new Set<string>();
  booked.add('E-6');
  booked.add('E-7');
  booked.add('F-7');
  booked.add('F-8');
  booked.add('G-5');
  booked.add('G-6');
  bookedSeatsStore.set(st.id, booked);
}

// Seat Holds: Map<holdToken, { showtimeId, seatIds, expiresAt, totalAmount, userEmail }>
interface HoldRecord {
  holdToken: string;
  showtimeId: string;
  seatIds: string[];
  expiresAt: number; // timestamp
  totalAmount: number;
  userEmail: string;
}
const holdsStore = new Map<string, HoldRecord>();

// Bookings store
interface BookingRecord {
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

let bookingsStore: BookingRecord[] = [
  {
    id: 'bk-sample-1',
    bookingReference: 'CNM-98421',
    movieId: 'mov-1',
    movieTitle: 'THE BATMAN',
    moviePoster: '/posters/batman.jpg',
    theatreId: 'th-1',
    theatreName: 'SPI Palazzo Cinemas',
    theatreLocation: 'Velachery',
    screenName: 'Screen 1 (IMAX Laser)',
    showtimeId: 'st-1',
    date: getLocalDateString(1),
    time: '18:00',
    format: 'IMAX 3D',
    seatIds: ['F-9', 'F-10'],
    totalAmount: 760,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    customerName: 'Adam Goya',
    customerEmail: 'adamgoya0810@gmail.com'
  }
];

// Release Alerts store
interface AlertRecord {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  language: string;
  releaseDate: string;
  subscribedAt: string;
  status: 'PENDING' | 'TICKETS_OPEN' | 'CANCELLED';
  userEmail: string;
  notes?: string;
}

let alertsStore: AlertRecord[] = [
  {
    id: 'alt-1',
    movieId: 'mov-12',
    movieTitle: 'SUPERMAN',
    moviePoster: '/posters/superman.jpg',
    language: 'English',
    releaseDate: '2026-07-11',
    subscribedAt: '2026-11-02T10:00:00Z',
    status: 'PENDING',
    userEmail: 'adamgoya0810@gmail.com',
    notes: 'Requested notify as soon as IMAX 3D booking opens.'
  },
  {
    id: 'alt-2',
    movieId: 'mov-3',
    movieTitle: 'DUNE: PART TWO',
    moviePoster: '/posters/dune-part-two.jpg',
    language: 'English',
    releaseDate: '2026-03-01',
    subscribedAt: '2026-10-25T14:30:00Z',
    status: 'TICKETS_OPEN',
    userEmail: 'adamgoya0810@gmail.com',
    notes: 'Showtimes are now available for booking!'
  }
];

// Users and Auth tokens
interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
}

const users: UserRecord[] = [
  {
    id: 'usr-1',
    name: 'Adam Goya',
    email: 'adamgoya0810@gmail.com',
    passwordHash: 'cinema123',
    role: 'USER'
  },
  {
    id: 'usr-admin',
    name: 'Cinema Curator (Admin)',
    email: 'admin@cinema.internal',
    passwordHash: 'admin123',
    role: 'ADMIN'
  }
];

// Helper to authenticate request
function getAuthUser(req: express.Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const rawPayload = token.includes('.') ? token.split('.')[1] : token;
    const payload = JSON.parse(Buffer.from(rawPayload, 'base64').toString());
    const email = payload.sub || payload.email || '';
    const role = (payload.role || '').toUpperCase();
    const isAdmin = role.includes('ADMIN') || email.includes('admin');
    return {
      id: payload.userId ? String(payload.userId) : '1',
      name: email || 'Curator Admin',
      email,
      passwordHash: '',
      role: isAdmin ? 'ADMIN' : 'USER'
    };
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// LOCAL POSTER ASSET MANAGEMENT
// -------------------------------------------------------------

// Admin: Upload Poster
app.post('/api/upload-poster', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { filename, data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  try {
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.jpg';
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const cleanBase = (filename || `poster-${Date.now()}`)
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-');
    const safeFilename = `${cleanBase}-${Date.now()}${ext}`;
    const targetDir = path.resolve(__dirname, 'public/posters');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    const posterUrl = `/posters/${safeFilename}`;
    return res.json({ posterUrl });
  } catch (err: any) {
    console.error('Upload poster error:', err);
    return res.status(500).json({ error: 'Failed to save poster image file.' });
  }
});

// Admin: Available Posters
app.get('/api/admin/available-posters', (_req, res) => {
  try {
    const postersDir = path.resolve(__dirname, 'public/posters');
    if (fs.existsSync(postersDir)) {
      const files = fs.readdirSync(postersDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      return res.json(files.map(f => `/posters/${f}`));
    }
    return res.json([]);
  } catch {
    return res.json([]);
  }
});

// -------------------------------------------------------------
// PROXY TO SPRING BOOT BACKEND (http://localhost:8080)
// -------------------------------------------------------------
const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:8080';

app.use('/api', async (req, res) => {
  const targetUrl = `${BACKEND_BASE}/api${req.url}`;
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== 'host' && typeof value === 'string') {
        headers[key] = value;
      }
    }

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    const backendRes = await fetch(targetUrl, options);
    res.status(backendRes.status);

    const contentType = backendRes.headers.get('content-type');
    if (contentType) {
      res.setHeader('content-type', contentType);
    }

    const buffer = await backendRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error(`Backend Proxy Error (${targetUrl}):`, err?.message || err);
    return res.status(502).json({
      error: 'Backend connection failed. Make sure Spring Boot is running on port 8080.',
      details: err?.message || String(err)
    });
  }
});

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role, time: Date.now() };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }
  });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name,
    email,
    passwordHash: password,
    role: 'USER'
  };
  users.push(newUser);

  const tokenPayload = { id: newUser.id, email: newUser.email, role: newUser.role, time: Date.now() };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  return res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token
    }
  });
});

// Auth: Me
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Movies: GET
app.get('/api/movies', (req, res) => {
  const { language, genre, showing, upcoming, search } = req.query;
  let result = [...movies];

  if (language) {
    result = result.filter(m => m.language.toLowerCase() === String(language).toLowerCase());
  }
  if (genre) {
    result = result.filter(m => m.genres.some(g => g.toLowerCase() === String(genre).toLowerCase()));
  }
  if (showing === 'true') {
    result = result.filter(m => m.isNowShowing);
  }
  if (upcoming === 'true') {
    result = result.filter(m => m.isUpcoming);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q) ||
      m.genres.some(g => g.toLowerCase().includes(q))
    );
  }

  return res.json(result);
});

// Movie by ID or slug
app.get('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(m => m.id === id || m.slug === id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found.' });
  }
  return res.json(movie);
});

// Admin: Add Movie
app.post('/api/movies', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { title, originalTitle, language, genres, runtimeMinutes, releaseDate, certification, rating, synopsis, posterUrl, backdropUrl, isNowShowing, isUpcoming, director, cast } = req.body;
  if (!title || !language || !synopsis) {
    return res.status(400).json({ error: 'Title, language and synopsis are required.' });
  }

  const parsedGenres: string[] = Array.isArray(genres)
    ? genres
    : typeof genres === 'string'
      ? genres.split(',').map((g: string) => g.trim()).filter(Boolean)
      : ['Drama'];

  const parsedCast: string[] = Array.isArray(cast)
    ? cast
    : typeof cast === 'string'
      ? cast.split(',').map((c: string) => c.trim()).filter(Boolean)
      : [];

  const newMovie: MovieRecord = {
    id: `mov-${Date.now()}`,
    title: title.toUpperCase(),
    originalTitle: originalTitle || title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    language,
    genres: parsedGenres.length > 0 ? parsedGenres : ['Drama'],
    runtimeMinutes: Number(runtimeMinutes) || 120,
    releaseDate: releaseDate || '2026-06-15',
    certification: certification || 'UA',
    rating: Number(rating) || 8.5,
    synopsis,
    posterUrl: posterUrl || '/posters/batman.jpg',
    backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    stillImages: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1000&q=80'
    ],
    isNowShowing: Boolean(isNowShowing),
    isUpcoming: Boolean(isUpcoming),
    director: director || 'Director',
    cast: parsedCast
  };

  movies.unshift(newMovie);
  return res.status(201).json(newMovie);
});

// Admin: Delete Movie
app.delete('/api/movies/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { id } = req.params;
  const idx = movies.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Movie not found.' });
  }

  const removed = movies.splice(idx, 1)[0];
  // Remove associated showtimes
  for (let i = showtimes.length - 1; i >= 0; i--) {
    if (showtimes[i].movieId === id) {
      showtimes.splice(i, 1);
    }
  }

  return res.json({ message: `Movie "${removed.title}" deleted successfully.`, movie: removed });
});

// Admin: Upload Poster
app.post('/api/upload-poster', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { filename, data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  try {
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.jpg';
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const cleanBase = (filename || `poster-${Date.now()}`)
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-');
    const safeFilename = `${cleanBase}-${Date.now()}${ext}`;
    const targetDir = path.resolve(__dirname, 'public/posters');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    const posterUrl = `/posters/${safeFilename}`;
    return res.json({ posterUrl });
  } catch (err: any) {
    console.error('Upload poster error:', err);
    return res.status(500).json({ error: 'Failed to save poster image file.' });
  }
});

// Admin: Available Posters
app.get('/api/admin/available-posters', (_req, res) => {
  try {
    const postersDir = path.resolve(__dirname, 'public/posters');
    if (fs.existsSync(postersDir)) {
      const files = fs.readdirSync(postersDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      return res.json(files.map(f => `/posters/${f}`));
    }
    return res.json([]);
  } catch {
    return res.json([]);
  }
});

// Theatres
app.get('/api/theatres', (_req, res) => {
  return res.json(theatres);
});

app.post('/api/theatres', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { name, location, city, address, screenName, screenType, capacity } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required.' });
  }

  const newTheatre: TheatreRecord = {
    id: `th-${Date.now()}`,
    name,
    location,
    city: city || 'Chennai',
    address: address || `${name}, ${location}`,
    screens: [
      {
        id: `sc-${Date.now()}`,
        name: screenName || 'Screen 1',
        type: screenType || 'Dolby Atmos 4K',
        capacity: Number(capacity) || 100
      }
    ]
  };

  theatres.push(newTheatre);
  return res.status(201).json(newTheatre);
});

// Admin: Delete Theatre
app.delete('/api/theatres/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { id } = req.params;
  const idx = theatres.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Theatre not found.' });
  }

  const removed = theatres.splice(idx, 1)[0];
  // Remove associated showtimes
  for (let i = showtimes.length - 1; i >= 0; i--) {
    if (showtimes[i].theatreId === id) {
      showtimes.splice(i, 1);
    }
  }

  return res.json({ message: `Theatre "${removed.name}" deleted successfully.`, theatre: removed });
});

// Showtimes
app.get('/api/showtimes', (req, res) => {
  const { movieId, theatreId, date } = req.query;
  let result = [...showtimes];

  if (movieId) {
    result = result.filter(st => st.movieId === movieId);
  }
  if (theatreId) {
    result = result.filter(st => st.theatreId === theatreId);
  }
  if (date) {
    result = result.filter(st => st.date === date);
  }

  return res.json(result);
});

app.post('/api/showtimes', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { movieId, theatreId, screenId, date, time, format, price } = req.body;
  if (!movieId || !theatreId || !date || !time) {
    return res.status(400).json({ error: 'Movie, theatre, date and time are required.' });
  }

  const theatre = theatres.find(t => t.id === theatreId);
  const screen = theatre?.screens.find(s => s.id === screenId) || theatre?.screens[0];

  const newShowtime: ShowtimeRecord = {
    id: `st-${Date.now()}`,
    movieId,
    theatreId,
    screenId: screen?.id || 'sc-1',
    screenName: screen?.name || 'Main Screen',
    date,
    time,
    format: format || '2D',
    price: Number(price) || 220,
    availableSeatsCount: (screen?.capacity || 100) - 4,
    totalSeatsCount: screen?.capacity || 100
  };

  showtimes.push(newShowtime);
  return res.status(201).json(newShowtime);
});

// Admin: Delete Showtime
app.delete('/api/showtimes/:id', (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const { id } = req.params;
  const idx = showtimes.findIndex(st => st.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Showtime not found.' });
  }

  const removed = showtimes.splice(idx, 1)[0];
  return res.json({ message: 'Showtime removed successfully.', showtime: removed });
});

// Seats for a Showtime
app.get('/api/showtimes/:id/seats', (req, res) => {
  const { id } = req.params;
  const showtime = showtimes.find(st => st.id === id);
  if (!showtime) {
    return res.status(404).json({ error: 'Showtime not found.' });
  }

  const bookedSet = bookedSeatsStore.get(id) || new Set<string>();

  // Check active holds
  const now = Date.now();
  const heldSet = new Set<string>();
  for (const [token, hold] of holdsStore.entries()) {
    if (hold.expiresAt < now) {
      holdsStore.delete(token); // cleanup expired hold
    } else if (hold.showtimeId === id) {
      hold.seatIds.forEach(s => heldSet.add(s));
    }
  }

  // Generate standard 10 rows (A to J) x 12 seats
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsList: Array<{
    id: string;
    row: string;
    number: number;
    tier: 'standard' | 'premium' | 'vip';
    price: number;
    status: 'available' | 'held' | 'booked';
  }> = [];

  for (const r of rows) {
    const isVip = r === 'A' || r === 'B';
    const isPremium = r === 'C' || r === 'D' || r === 'E' || r === 'F';
    const tier = isVip ? 'vip' : (isPremium ? 'premium' : 'standard');
    const seatPrice = isVip ? showtime.price + 100 : (isPremium ? showtime.price + 40 : showtime.price);

    for (let num = 1; num <= 12; num++) {
      const seatId = `${r}-${num}`;
      let status: 'available' | 'held' | 'booked' = 'available';

      if (bookedSet.has(seatId)) {
        status = 'booked';
      } else if (heldSet.has(seatId)) {
        status = 'held';
      }

      seatsList.push({
        id: seatId,
        row: r,
        number: num,
        tier,
        price: seatPrice,
        status
      });
    }
  }

  return res.json({
    showtime,
    seats: seatsList
  });
});

// Seat Holds: POST /api/holds
app.post('/api/holds', (req, res) => {
  const { showtimeId, seatIds, userEmail } = req.body;
  if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Showtime ID and seat list are required.' });
  }

  const showtime = showtimes.find(st => st.id === showtimeId);
  if (!showtime) {
    return res.status(404).json({ error: 'Showtime not found.' });
  }

  const bookedSet = bookedSeatsStore.get(showtimeId) || new Set<string>();
  const now = Date.now();

  // Check if any seat is already booked or currently held
  for (const seatId of seatIds) {
    if (bookedSet.has(seatId)) {
      return res.status(409).json({ error: `Seat ${seatId} has already been booked by another guest.` });
    }
    for (const [t, hold] of holdsStore.entries()) {
      if (hold.expiresAt > now && hold.showtimeId === showtimeId && hold.seatIds.includes(seatId)) {
        return res.status(409).json({ error: `Seat ${seatId} is currently held by another guest.` });
      }
    }
  }

  // 5-minute hold as required by specification
  const durationSeconds = 300;
  const expiresAt = now + durationSeconds * 1000;
  const holdToken = `hold-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Calculate total price based on seat tiers
  let totalAmount = 0;
  for (const s of seatIds) {
    const row = s.split('-')[0];
    const isVip = row === 'A' || row === 'B';
    const isPrem = row === 'C' || row === 'D' || row === 'E' || row === 'F';
    totalAmount += isVip ? showtime.price + 100 : (isPrem ? showtime.price + 40 : showtime.price);
  }

  const holdRecord: HoldRecord = {
    holdToken,
    showtimeId,
    seatIds,
    expiresAt,
    totalAmount,
    userEmail: userEmail || 'guest@cinema.internal'
  };

  holdsStore.set(holdToken, holdRecord);

  return res.json({
    holdToken,
    showtimeId,
    seatIds,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresInSeconds: durationSeconds,
    totalAmount
  });
});

// Release Hold: DELETE /api/holds/:token
app.delete('/api/holds/:token', (req, res) => {
  const { token } = req.params;
  if (holdsStore.has(token)) {
    holdsStore.delete(token);
    return res.json({ message: 'Seat hold released successfully.' });
  }
  return res.json({ message: 'Hold not found or already released.' });
});

// Bookings: POST /api/bookings
app.post('/api/bookings', (req, res) => {
  const { holdToken, customerName, customerEmail } = req.body;
  if (!holdToken) {
    return res.status(400).json({ error: 'Hold token is required to confirm booking.' });
  }

  const hold = holdsStore.get(holdToken);
  if (!hold) {
    return res.status(400).json({ error: 'Hold expired or invalid. Please select your seats again.' });
  }

  if (Date.now() > hold.expiresAt) {
    holdsStore.delete(holdToken);
    return res.status(410).json({ error: 'The 5-minute seat reservation has expired. Please reselect your seats.' });
  }

  const showtime = showtimes.find(st => st.id === hold.showtimeId);
  const movie = movies.find(m => m.id === showtime?.movieId);
  const theatre = theatres.find(t => t.id === showtime?.theatreId);

  if (!showtime || !movie || !theatre) {
    return res.status(400).json({ error: 'Invalid booking data references.' });
  }

  // Mark seats as booked
  let bookedSet = bookedSeatsStore.get(hold.showtimeId);
  if (!bookedSet) {
    bookedSet = new Set<string>();
    bookedSeatsStore.set(hold.showtimeId, bookedSet);
  }
  hold.seatIds.forEach(s => bookedSet!.add(s));

  // Release hold
  holdsStore.delete(holdToken);

  // Create confirmed booking
  const bookingReference = `CNM-${Math.floor(10000 + Math.random() * 90000)}`;
  const booking: BookingRecord = {
    id: `bk-${Date.now()}`,
    bookingReference,
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    theatreId: theatre.id,
    theatreName: theatre.name,
    theatreLocation: theatre.location,
    screenName: showtime.screenName,
    showtimeId: showtime.id,
    date: showtime.date,
    time: showtime.time,
    format: showtime.format,
    seatIds: hold.seatIds,
    totalAmount: hold.totalAmount,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    customerName: customerName || hold.userEmail.split('@')[0] || 'Guest',
    customerEmail: customerEmail || hold.userEmail
  };

  bookingsStore.unshift(booking);
  return res.status(201).json(booking);
});

// Bookings: List
app.get('/api/bookings', (req, res) => {
  const { email } = req.query;
  let result = [...bookingsStore];
  if (email) {
    result = result.filter(b => b.customerEmail.toLowerCase() === String(email).toLowerCase());
  }
  return res.json(result);
});

// Booking: Get by reference
app.get('/api/bookings/:ref', (req, res) => {
  const { ref } = req.params;
  const booking = bookingsStore.find(b => b.bookingReference === ref || b.id === ref);
  if (!booking) {
    return res.status(404).json({ error: 'Booking reference not found.' });
  }
  return res.json(booking);
});

// Booking: Cancel
app.delete('/api/bookings/:ref', (req, res) => {
  const { ref } = req.params;
  const bookingIndex = bookingsStore.findIndex(b => b.bookingReference === ref || b.id === ref);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const booking = bookingsStore[bookingIndex];
  if (booking.status === 'CANCELLED') {
    return res.status(400).json({ error: 'Booking is already cancelled.' });
  }

  // Free seats in showtime
  const bookedSet = bookedSeatsStore.get(booking.showtimeId);
  if (bookedSet) {
    booking.seatIds.forEach(s => bookedSet.delete(s));
  }

  booking.status = 'CANCELLED';
  return res.json({ message: 'Booking cancelled successfully.', booking });
});

// Alerts: GET
app.get('/api/alerts', (req, res) => {
  const { email } = req.query;
  let result = [...alertsStore];
  if (email) {
    result = result.filter(a => a.userEmail.toLowerCase() === String(email).toLowerCase());
  }
  return res.json(result);
});

// Alerts: Create (Used by Assistant or directly)
app.post('/api/alerts', (req, res) => {
  const { movieId, movieTitle, userEmail, notes } = req.body;
  const movie = movies.find(m => m.id === movieId || m.title.toLowerCase() === (movieTitle || '').toLowerCase());

  if (!movie) {
    return res.status(404).json({ error: 'Movie not found for subscription.' });
  }

  const existing = alertsStore.find(
    a => a.movieId === movie.id && a.userEmail.toLowerCase() === (userEmail || 'adamgoya0810@gmail.com').toLowerCase() && a.status !== 'CANCELLED'
  );
  if (existing) {
    return res.json(existing);
  }

  const newAlert: AlertRecord = {
    id: `alt-${Date.now()}`,
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    language: movie.language,
    releaseDate: movie.releaseDate,
    subscribedAt: new Date().toISOString(),
    status: movie.isNowShowing ? 'TICKETS_OPEN' : 'PENDING',
    userEmail: userEmail || 'adamgoya0810@gmail.com',
    notes: notes || 'Release alert subscription created via CINEMA.'
  };

  alertsStore.unshift(newAlert);
  return res.status(201).json(newAlert);
});

// Alerts: Delete / Cancel
app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  const idx = alertsStore.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Subscription alert not found.' });
  }
  alertsStore[idx].status = 'CANCELLED';
  return res.json({ message: 'Alert subscription cancelled.', alert: alertsStore[idx] });
});

// -------------------------------------------------------------
// AI Conversational Movie Booking & Alerts Endpoint
// -------------------------------------------------------------
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { messages, userEmail = 'adamgoya0810@gmail.com' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Rule-based concierge engine
    const lower = lastUserMessage.toLowerCase();
    let reply = "I would be glad to help you find screenings, reserve prime seats, or set release alerts.";
    let structuredAction: any = null;

    if (lower.includes('alert') || lower.includes('notify') || lower.includes('upcoming') || lower.includes('jailer') || lower.includes('spider-man') || lower.includes('kalki')) {
      const target = movies.find(m => m.isUpcoming || lower.includes(m.title.toLowerCase())) || movies[6];
      const newAlert: AlertRecord = {
        id: `alt-${Date.now()}`,
        movieId: target.id,
        movieTitle: target.title,
        moviePoster: target.posterUrl,
        language: target.language,
        releaseDate: target.releaseDate,
        subscribedAt: new Date().toISOString(),
        status: target.isNowShowing ? 'TICKETS_OPEN' : 'PENDING',
        userEmail,
        notes: `Release alert registered for ${target.title}.`
      };
      if (!alertsStore.some(a => a.movieId === target.id && a.userEmail === userEmail && a.status !== 'CANCELLED')) {
        alertsStore.unshift(newAlert);
      }
      reply = `I have registered an alert for "${target.title}". You will receive instant priority notifications the moment booking opens.`;
      structuredAction = {
        type: 'ALERT_SUBSCRIPTION',
        payload: {
          movieId: target.id,
          movieTitle: target.title,
          status: 'CONFIRMED'
        }
      };
    } else if (lower.includes('tamil') || lower.includes('action') || lower.includes('tonight') || lower.includes('recommend') || lower.includes('movie')) {
      const matched = movies.filter(m => m.isNowShowing && (lower.includes('tamil') ? m.language === 'Tamil' : true)).slice(0, 3);
      reply = `Here are our finest selections currently screening across Chennai. Select a film to view showtimes or request seat bookings.`;
      structuredAction = {
        type: 'MOVIES_LIST',
        payload: {
          movieIds: matched.map(m => m.id)
        }
      };
    } else if (lower.includes('velachery') || lower.includes('palazzo') || lower.includes('showtime') || lower.includes('ticket')) {
      reply = `Showing available timeslots at SPI Palazzo Cinemas (Velachery) and PVR ICON. Choose a show to inspect seat availability:`;
      structuredAction = {
        type: 'SHOWTIMES_PICKER',
        payload: {
          movieId: 'mov-1',
          theatreId: 'th-1'
        }
      };
    } else if (lower.includes('seat') || lower.includes('book')) {
      reply = `I have locked two prime center seats (F-9, F-10) for The Batman in Screen 1. You have a 5-minute reservation window to finalize your booking:`;
      structuredAction = {
        type: 'SEATS_PREVIEW',
        payload: {
          showtimeId: 'st-1',
          recommendedSeats: ['F-9', 'F-10']
        }
      };
    }

    return res.json({ reply, structuredAction });
  } catch (err: any) {
    console.error('Assistant API Error:', err);
    return res.status(500).json({
      error: 'An error occurred while communicating with the cinema assistant.',
      details: err?.message || String(err)
    });
  }
});

// Vite Dev Server Middleware mounting or static serve
async function startServer() {
  // Directly serve static poster assets with Express before Vite middleware
  app.use('/posters', express.static(path.resolve(__dirname, 'public/posters')));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CINEMA application server listening on port ${PORT}`);
  });
}

startServer();
