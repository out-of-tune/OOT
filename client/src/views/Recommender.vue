<template>
  <div>
    <h1>Spotify Recommendations Generator</h1>
    <button @click="openDialog">Open Dialog</button>

    <v-dialog v-model="dialogVisible">
      <h2>Spotify Recommendations Generator</h2>

      <!-- Limit -->
      <div class="param-group">
        <h3>Limit</h3>
        <input type="number" v-model="limit" />
      </div>

      <!-- Market -->
      <div class="param-group">
        <h3>Market</h3>
        <input type="text" v-model="market" />
      </div>

      <!-- Seed Artists -->
      <div class="param-group">
        <h3>Seed Artists</h3>
        <input type="text" v-model="seedArtists" />
      </div>

      <!-- Seed Genres -->
      <div class="param-group">
        <h3>Seed Genres</h3>
        <input type="text" v-model="seedGenres" />
      </div>

      <!-- Seed Tracks -->
      <div class="param-group">
        <h3>Seed Tracks</h3>
        <input type="text" v-model="seedTracks" />
      </div>

      <!-- Acousticness -->
      <div class="param-group">
        <h3>Acousticness</h3>
        <p>Select one of the following:</p>
        <div v-for="option in acousticnessOptions" :key="option">
          <input type="radio" :value="option" v-model="selectedAcousticness" />
          <label>{{ option }}</label>
        </div>
      </div>

      <!-- Danceability -->
      <div class="param-group">
        <h3>Danceability</h3>
        <p>Select one of the following:</p>
        <div v-for="option in danceabilityOptions" :key="option">
          <input type="radio" :value="option" v-model="selectedDanceability" />
          <label>{{ option }}</label>
        </div>
      </div>

      <!-- Add similar sections for other parameters -->

      <button @click="generateRecommendations">Generate Recommendations</button>
      <button @click="closeDialog">Close</button>
    </v-dialog>

    <div v-if="recommendations.length">
      <h2>Recommendations</h2>
      <ul>
        <li v-for="track in recommendations" :key="track.id">
          {{ track.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState({ spotify: (state) => state.spotify }),
  },
  data() {
    return {
      dialogVisible: false,
      endpoint: "https://api.spotify.com/v1/recommendations",
      limit: null,
      market: null,
      seedArtists: null,
      seedGenres: null,
      seedTracks: null,
      selectedAcousticness: null,
      selectedDanceability: null,
      // Add data properties for other parameters and options
      recommendations: [], // To store the retrieved recommendations
      acousticnessOptions: [0.2, 0.4, 0.6, 0.8],
      danceabilityOptions: [0.2, 0.4, 0.6, 0.8],
      // Define options for other parameters
    };
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    generateRecommendations() {
      // Here, you can use the selected options to construct your API request
      const params = {
        limit: this.limit,
        market: this.market,
        seed_artists: this.seedArtists,
        seed_genres: this.seedGenres,
        seed_tracks: this.seedTracks,
        target_acousticness: this.selectedAcousticness,
        target_danceability: this.selectedDanceability,
        // Add other parameters as needed
      };
      console.log(this.spotify);

      axios
        .get(this.endpoint, {
          config: { params },
          headers: {
            Authorization: `Bearer ${this.spotify.accessToken}`, // Replace with your Spotify access token
          },
        })
        .then((response) => {
          // Store the retrieved recommendations
          this.recommendations = response.data.tracks;
          console.log(response);
        })
        .catch((error) => {
          console.error("Error fetching recommendations:", error);
        });
    },
  },
};
</script>
