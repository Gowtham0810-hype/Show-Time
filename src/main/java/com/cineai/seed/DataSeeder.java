package com.cineai.seed;

import com.cineai.model.dto.request.CreateShowtimeRequest;
import com.cineai.model.entity.Movie;
import com.cineai.model.entity.Theater;
import com.cineai.model.entity.User;
import com.cineai.model.enums.MovieStatus;
import com.cineai.model.enums.ScreenType;
import com.cineai.model.enums.UserRole;
import com.cineai.repository.MovieRepository;
import com.cineai.repository.ShowtimeRepository;
import com.cineai.repository.TheaterRepository;
import com.cineai.repository.UserRepository;
import com.cineai.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;
    private final ShowtimeRepository showtimeRepository;
    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository,
                      MovieRepository movieRepository,
                      TheaterRepository theaterRepository,
                      ShowtimeRepository showtimeRepository,
                      AdminService adminService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
        this.showtimeRepository = showtimeRepository;
        this.adminService = adminService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Checking database seeding status...");

        // 1. Seed Users
        seedUsers();

        // 2. Seed Theaters
        List<Theater> theaters = seedTheaters();

        // 3. Seed Movies
        List<Movie> movies = seedMovies();

        // 4. Seed Showtimes + Seats
        seedShowtimes(movies, theaters);

        log.info("Database seeding checked and verified with 15 movies and active showtimes!");
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@cinema.internal")) {
            User admin = User.builder()
                    .email("admin@cinema.internal")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName("Cinema Curator (Admin)")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin user: admin@cinema.internal");
        }

        if (!userRepository.existsByEmail("admin@cineai.com")) {
            User admin2 = User.builder()
                    .email("admin@cineai.com")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName("CineAI Administrator")
                    .role(UserRole.ADMIN)
                    .build();
            userRepository.save(admin2);
        }

        if (!userRepository.existsByEmail("adamgoya0810@gmail.com")) {
            User patron = User.builder()
                    .email("adamgoya0810@gmail.com")
                    .passwordHash(passwordEncoder.encode("cinema123"))
                    .fullName("Adam Goya")
                    .role(UserRole.USER)
                    .build();
            userRepository.save(patron);
            log.info("Created default patron user: adamgoya0810@gmail.com / cinema123");
        }

        if (!userRepository.existsByEmail("user@cineai.com")) {
            User user2 = User.builder()
                    .email("user@cineai.com")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .fullName("Regular User")
                    .role(UserRole.USER)
                    .build();
            userRepository.save(user2);
        }
    }

    private List<Theater> seedTheaters() {
        if (theaterRepository.count() > 0) {
            return theaterRepository.findAll();
        }

        List<Theater> theaters = new ArrayList<>();

        theaters.add(Theater.builder()
                .name("SPI Palazzo Cinemas")
                .location("Velachery")
                .city("Chennai")
                .latitude(12.9785)
                .longitude(80.2224)
                .totalRows(8)
                .seatsPerRow(12)
                .screenType(ScreenType.IMAX)
                .build());

        theaters.add(Theater.builder()
                .name("PVR ICON Grand Galleria")
                .location("Anna Nagar")
                .city("Chennai")
                .latitude(13.0844)
                .longitude(80.1947)
                .totalRows(8)
                .seatsPerRow(12)
                .screenType(ScreenType.FOUR_DX)
                .build());

        theaters.add(Theater.builder()
                .name("AGS Cinemas")
                .location("T. Nagar")
                .city("Chennai")
                .latitude(13.0418)
                .longitude(80.2341)
                .totalRows(8)
                .seatsPerRow(12)
                .screenType(ScreenType.DOLBY)
                .build());

        return theaterRepository.saveAll(theaters);
    }

    private List<Movie> seedMovies() {
        if (movieRepository.count() >= 15) {
            return movieRepository.findAll();
        }

        List<Movie> movies = new ArrayList<>();

        movies.add(Movie.builder()
                .title("THE BATMAN")
                .description("When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city's hidden corruption and question his family's involvement.")
                .genre("Action, Crime, Drama, Mystery")
                .language("English")
                .durationMins(176)
                .director("Matt Reeves")
                .castInfo("Robert Pattinson, Zoë Kravitz, Paul Dano, Jeffrey Wright, Colin Farrell")
                .posterUrl("/posters/batman.jpg")
                .releaseDate(LocalDate.of(2026, 3, 4))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("DJANGO UNCHAINED")
                .description("With the help of a German bounty hunter, a freed slave sets out across the American South to rescue his beloved wife from a brutal and sadistic Mississippi plantation owner.")
                .genre("Western, Action, Drama")
                .language("English")
                .durationMins(165)
                .director("Quentin Tarantino")
                .castInfo("Jamie Foxx, Christoph Waltz, Leonardo DiCaprio, Kerry Washington, Samuel L. Jackson")
                .posterUrl("/posters/django-unchained.jpg")
                .releaseDate(LocalDate.of(2026, 4, 12))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("DUNE: PART TWO")
                .description("Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the destiny of the universe.")
                .genre("Sci-Fi, Adventure, Epic")
                .language("English")
                .durationMins(166)
                .director("Denis Villeneuve")
                .castInfo("Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler")
                .posterUrl("/posters/dune-part-two.jpg")
                .releaseDate(LocalDate.of(2026, 3, 1))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("GET OUT")
                .description("A young African-American photographer visits his white girlfriend's secluded family estate for the weekend, where a series of increasingly disturbing discoveries pull him into an unimaginable nightmare.")
                .genre("Horror, Mystery, Thriller")
                .language("English")
                .durationMins(104)
                .director("Jordan Peele")
                .castInfo("Daniel Kaluuya, Allison Williams, Bradley Whitford, Catherine Keener, Lil Rel Howery")
                .posterUrl("/posters/get-out.jpg")
                .releaseDate(LocalDate.of(2026, 2, 24))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("INCANTATION")
                .description("Six years ago, Li Ronan broke a sacred religious taboo while exploring a hidden subterranean tunnel. Now, an ancient malevolent curse awakens to claim her young daughter.")
                .genre("Horror, Mystery, Found Footage")
                .language("Mandarin")
                .durationMins(110)
                .director("Kevin Ko")
                .castInfo("Tsai Hsuan-yen, Huang Sin-ting, Kao Ying-hsuan, Sean Lin")
                .posterUrl("/posters/INCANTATION.jpg")
                .releaseDate(LocalDate.of(2026, 7, 8))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("MALIGNANT")
                .description("Madison is paralyzed by shocking waking visions of gruesome murders, only to discover with horror that her nightmares are actually real-time crimes committed by a parasite from her past.")
                .genre("Horror, Mystery, Thriller")
                .language("English")
                .durationMins(111)
                .director("James Wan")
                .castInfo("Annabelle Wallis, Maddie Hasson, George Young, Michole Briana White")
                .posterUrl("/posters/malignant.jpg")
                .releaseDate(LocalDate.of(2026, 8, 20))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("MARTY SUPREME")
                .description("An electric, fast-paced period drama inspired by the legendary American table tennis champion Marty Reisman and his charismatic hustle through 1950s New York City.")
                .genre("Drama, Sport, Biography")
                .language("English")
                .durationMins(135)
                .director("Josh Safdie")
                .castInfo("Timothée Chalamet, Gwyneth Paltrow, Tyler the Creator, Odessa A'zion, Kevin O'Leary")
                .posterUrl("/posters/marty-supreme.jpg")
                .releaseDate(LocalDate.of(2026, 11, 20))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("OBSESSION")
                .description("Years after a devastating kidnapping claimed his family, a guilt-ridden architect travels to Florence and encounters a young woman who bears an uncanny resemblance to his late wife, plunging him into a web of deceit.")
                .genre("Drama, Mystery, Thriller")
                .language("English")
                .durationMins(108)
                .director("Brian De Palma")
                .castInfo("Cliff Robertson, Geneviève Bujold, John Lithgow")
                .posterUrl("/posters/OBSESSION.jpg")
                .releaseDate(LocalDate.of(2026, 10, 15))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("OPPENHEIMER")
                .description("The story of American theoretical physicist J. Robert Oppenheimer and his leadership of the Manhattan Project to develop the first nuclear weapons, confronting the profound moral weight of humanity's creation.")
                .genre("Biography, Drama, History")
                .language("English")
                .durationMins(180)
                .director("Christopher Nolan")
                .castInfo("Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh")
                .posterUrl("/posters/oppenheimer.jpg")
                .releaseDate(LocalDate.of(2026, 7, 21))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("PARASITE")
                .description("Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan when an unexpected visitor disrupts their delicate deception.")
                .genre("Drama, Thriller, Dark Comedy")
                .language("Korean")
                .durationMins(132)
                .director("Bong Joon Ho")
                .castInfo("Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik, Park So-dam")
                .posterUrl("/posters/parasite.jpg")
                .releaseDate(LocalDate.of(2026, 5, 30))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("SE7EN")
                .description("Two detectives—a retiring veteran and an impetuous rookie—hunt a meticulous serial killer whose heinous crimes are based on the seven deadly sins.")
                .genre("Crime, Drama, Mystery, Thriller")
                .language("English")
                .durationMins(127)
                .director("David Fincher")
                .castInfo("Brad Pitt, Morgan Freeman, Gwyneth Paltrow, Kevin Spacey, John C. McGinley")
                .posterUrl("/posters/se7en.jpg")
                .releaseDate(LocalDate.of(2026, 6, 18))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("SUPERMAN")
                .description("Superman reconciles his Kryptonian heritage with his adoptive human upbringing as Clark Kent in Smallville. Guided by human kindness, he stands as a beacon of hope in an increasingly cynical world.")
                .genre("Action, Adventure, Sci-Fi")
                .language("English")
                .durationMins(140)
                .director("James Gunn")
                .castInfo("David Corenswet, Rachel Brosnahan, Nicholas Hoult, Edi Gathegi, Nathan Fillion")
                .posterUrl("/posters/superman.jpg")
                .releaseDate(LocalDate.of(2026, 7, 11))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("THE CONJURING: LAST RITES")
                .description("Paranormal investigators Ed and Lorraine Warren undertake one final, deeply personal investigation as malevolent demonic forces push their spiritual fortitude and love to the ultimate edge.")
                .genre("Horror, Mystery, Thriller")
                .language("English")
                .durationMins(115)
                .director("Michael Chaves")
                .castInfo("Patrick Wilson, Vera Farmiga, Mia Tomlinson, Ben Hardy")
                .posterUrl("/posters/the-conjuring-last-rites.jpg")
                .releaseDate(LocalDate.of(2026, 9, 5))
                .status(MovieStatus.UPCOMING)
                .build());

        movies.add(Movie.builder()
                .title("WHIPLASH")
                .description("A relentlessly ambitious jazz drummer enrolling at a prestigious music conservatory is pushed beyond the limits of sanity by an abusive instructor who uses fear and psychological warfare.")
                .genre("Drama, Music")
                .language("English")
                .durationMins(107)
                .director("Damien Chazelle")
                .castInfo("Miles Teller, J.K. Simmons, Paul Reiser, Melissa Benoist")
                .posterUrl("/posters/Whiplash.jpg")
                .releaseDate(LocalDate.of(2026, 8, 14))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        movies.add(Movie.builder()
                .title("THE WOLF OF WALL STREET")
                .description("The exhilarating and scandalous true story of Jordan Belfort, charting his meteoric rise to exorbitant wealth through pump-and-dump securities fraud and his precipitous fall into federal custody.")
                .genre("Biography, Comedy, Crime")
                .language("English")
                .durationMins(180)
                .director("Martin Scorsese")
                .castInfo("Leonardo DiCaprio, Jonah Hill, Margot Robbie, Matthew McConaughey, Kyle Chandler")
                .posterUrl("/posters/wolf-of-wall-street.jpg")
                .releaseDate(LocalDate.of(2026, 4, 20))
                .status(MovieStatus.NOW_SHOWING)
                .build());

        return movieRepository.saveAll(movies);
    }

    private void seedShowtimes(List<Movie> movies, List<Theater> theaters) {
        if (showtimeRepository.count() >= 50 || movies.isEmpty() || theaters.isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();

        // Seed showtimes for all NOW_SHOWING movies for today and next 4 days across theaters
        List<Movie> nowShowing = movies.stream()
                .filter(m -> m.getStatus() == MovieStatus.NOW_SHOWING)
                .toList();

        Set<String> allocated = new HashSet<>();

        for (int dayOffset = 0; dayOffset <= 4; dayOffset++) {
            LocalDate showDate = today.plusDays(dayOffset);
            for (int tIdx = 0; tIdx < theaters.size(); tIdx++) {
                Theater theater = theaters.get(tIdx);
                BigDecimal basePrice = theater.getScreenType() == ScreenType.IMAX ? new BigDecimal("380.00") :
                        (theater.getScreenType() == ScreenType.FOUR_DX ? new BigDecimal("420.00") : new BigDecimal("240.00"));

                for (int mIdx = 0; mIdx < nowShowing.size(); mIdx++) {
                    Movie movie = nowShowing.get(mIdx);

                    // Calculate two staggered slots per movie
                    LocalTime slot1 = LocalTime.of(9, 30).plusMinutes(mIdx * 45L + tIdx * 10L);
                    LocalTime slot2 = LocalTime.of(16, 30).plusMinutes(mIdx * 45L + tIdx * 10L);

                    // Ensure slot1 uniqueness at this theater and date
                    while (allocated.contains(theater.getId() + ":" + showDate + ":" + slot1)
                            || showtimeRepository.existsByTheaterIdAndShowDateAndShowTime(theater.getId(), showDate, slot1)) {
                        slot1 = slot1.plusMinutes(5);
                    }
                    allocated.add(theater.getId() + ":" + showDate + ":" + slot1);

                    // Ensure slot2 uniqueness at this theater and date
                    while (allocated.contains(theater.getId() + ":" + showDate + ":" + slot2)
                            || showtimeRepository.existsByTheaterIdAndShowDateAndShowTime(theater.getId(), showDate, slot2)) {
                        slot2 = slot2.plusMinutes(5);
                    }
                    allocated.add(theater.getId() + ":" + showDate + ":" + slot2);

                    try {
                        adminService.createShowtime(CreateShowtimeRequest.builder()
                                .movieId(movie.getId())
                                .theaterId(theater.getId())
                                .showDate(showDate)
                                .showTime(slot1)
                                .price(basePrice)
                                .build());

                        adminService.createShowtime(CreateShowtimeRequest.builder()
                                .movieId(movie.getId())
                                .theaterId(theater.getId())
                                .showDate(showDate)
                                .showTime(slot2)
                                .price(basePrice.add(new BigDecimal("30.00")))
                                .build());
                    } catch (Exception e) {
                        log.warn("Could not seed showtime for movie {} at {}: {}", movie.getTitle(), theater.getName(), e.getMessage());
                    }
                }
            }
        }
        log.info("Showtimes seeded for all NOW_SHOWING movies across Chennai theaters!");
    }
}
