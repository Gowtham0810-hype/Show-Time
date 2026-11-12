package com.cineai.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MovieBrowsingAndShowtimeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListMoviesAndSupportSearchFilters() throws Exception {
        // List all movies
        mockMvc.perform(get("/api/movies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(5))));

        // Filter by search keyword
        mockMvc.perform(get("/api/movies").param("search", "Interstellar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Interstellar"));

        // Filter by genre
        mockMvc.perform(get("/api/movies").param("genre", "Sci-Fi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void shouldGetMovieDetailsAndShowtimes() throws Exception {
        mockMvc.perform(get("/api/movies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.title").value("Interstellar"));

        mockMvc.perform(get("/api/movies/1/showtimes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void shouldQueryShowtimesByFilters() throws Exception {
        mockMvc.perform(get("/api/showtimes").param("city", "Bangalore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].theaterCity", equalToIgnoringCase("Bangalore")));

        mockMvc.perform(get("/api/showtimes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }
}
