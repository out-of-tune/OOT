<template>
  <div>
    <v-dialog v-model="showTour" max-width="40vw" dark>
      <v-card>
        <v-card-title class="headline"
          >Do you want to take a tour through out-of-tune?</v-card-title
        >

        <v-card-text>
          We prepared a little tutorial for you with all the basic knowledge you
          need! If you want a more extensive guide visit our
          <router-link :to="{ name: 'Help' }" target="_blank"
            >help page</router-link
          >.
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <button color="red darken-1" text @click="setShowTour(false)">
            Skip tour
          </button>
          <button color="green darken-1" text @click="startTour">
            Start tour
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-tour name="introTour" :steps="steps"></v-tour>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "introTour",
  data: () => {
    return {
      steps: [
        {
          target: "body",
          content:
            "Out-of-tune utilizes a so-called graph. This graph consists of dots and lines (nodes and edges). The nodes represent different artists, genres, albums and songs.",
          params: {
            placement: "none",
          },
        },
        {
          target: "body",
          content:
            "The graph is interactive. You are able to click on every node, select multiple of them, move them,...",
          params: {
            placement: "none",
          },
        },
        {
          target: "#MouseActionRadio",
          content:
            "You can choose what happens when you click on a node. You can switch between expand, collapse and explore.",
          params: {
            placement: "bottom",
          },
        },
        {
          target: "#expand",
          content:
            "New nodes and edges will be added if you are in expand mode.",
          params: {
            placement: "left",
          },
        },
        {
          target: "#collapse",
          content:
            "Connected nodes will be removed when you are in collapse mode. You can use this mode to delete unwanted connections.",
          params: {
            placement: "left",
          },
        },
        {
          target: "#explore",
          content:
            "You will see changes in the node info box when you are in explore mode, but the graph itself won't change.",
          params: {
            placement: "left",
          },
        },
        {
          target: ".nodeInfo",
          content:
            "Data of the last clicked node will be shown here. Interact with the content of the box - listen to a song, add them to the queue, ...",
          params: {
            placement: "right",
          },
        },
        {
          target: "#searchContainer",
          content:
            "To search for artists, songs, albums and genres, just write a search query! Found nodes will be added to the graph subsequently.",
        },
        {
          target: "#settings",
          content:
            "You can change the appearance of the graph in the settings, but beware: It is rather technical, so you might want to look at the help page.",
          params: {
            placement: "left",
          },
        },
        {
          target: "#loadsavepop",
          content:
            "Store and load your graphs and configurations here, to re-use them later.",
          params: {
            placement: "top",
          },
        },
        {
          target: "#playlistLoader",
          content:
            "Visualize your Spotify Playlists - either log in and view your own playlists, or copy a Spotify Playlist URI and load it!",
          params: {
            placement: "left",
          },
        },
        {
          target: "#selectionpop",
          content:
            "Select nodes via the search or SHIFT + DRAG. You are able to move the selected nodes and position them as you like! You can also perform lots of other actions, check them out!",
          params: {
            placement: "top",
          },
        },
        {
          target: "body",
          content:
            "If the graph is moving too fast, you can press SPACEBAR to pause all motion.",
          params: {
            placement: "none",
          },
        },
        {
          target: "#helpLink",
          content:
            "If you want to look up some other keyboard shortcuts, or if you need further assistance, visit the help page.",
          params: {
            placement: "left",
          },
        },
        {
          target: "#feedback",
          content: "We would be delighted if you leave some feedback!",
          params: {
            placement: "left",
          },
        },
        {
          target: "body",
          content: "Thank you for using out-ouf-tune <3",
          params: {
            placement: "none",
          },
        },
      ],
      dialog: true,
    };
  },
  mounted: function () {},
  computed: {
    ...mapState({
      showTour: (state) => state.events.showTour,
    }),
  },
  methods: {
    ...mapActions(["setShowTour"]),
    startTour: function () {
      this.$tours["introTour"].start();
      this.setShowTour(false);
    },
  },
};
</script>

<style>
.v-step {
  z-index: 1000 !important;
}
</style>
