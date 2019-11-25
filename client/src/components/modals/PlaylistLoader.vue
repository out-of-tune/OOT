<template>
    <div>
        <!-- The Modal -->
        <div v-if="open" id="myModal" class="modal">
            <!-- Modal content -->
            <div class="card">
                <v-icon dark @click="changePlaylistLoaderState(false)" class="close">close</v-icon>
                <div class="playlist-box" v-if="loggedIn">
                    <div>
                        <h2>Your playlists</h2>
                        <PaginatedList :listData="playlists" columnOnePath="playlist.name" :itemStyle="{ display: 'grid', 'grid-template-columns': '1fr 1fr', paddingBottom: '0.5rem'}" :itemClick="setCurrentPlaylist"></PaginatedList>
                    </div>
                    <div>
                        Add an URI: <v-text-field
                            autocomplete="off"
                            dark
                            color="white"
                            type="text"
                            ref="searchInput"
                            name="uriField"
                            id="searchField"
                            label="Spotify URI"
                            v-model="uriString"
                        ></v-text-field>
                        <v-btn small @click="loadPlaylistFromUri(uriString)">load playlist</v-btn>
                        <h2>current Playlist</h2>
                        {{currentPlaylist.name}}
                        <v-btn small @click="loadPlaylistFromUser(currentPlaylist.id)">load playlist</v-btn>
                    </div>
                </div>
                 <div v-else class="login-box">
                    <div class="content">
                        <h1>You have to be logged in to Spotify to access playlists</h1>
                        <v-btn small v-if="!loggedIn" id="login" outline color="#ffffff" v-on:click="loginUser">login</v-btn>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>
<script>
import PaginatedList from "@/components/helpers/PaginatedList"
import { mapState, mapActions } from 'vuex'
import { event } from 'vue-analytics'
export default {
    data: ()=>({
        uriString: ""
    }),
    components: {
        PaginatedList
    },
    computed: {
        ...mapState({
            open: state => state.playlists.playlistLoaderOpen,
            playlists: state => state.playlists.playlists,
            currentPlaylist: state => state.playlists.currentPlaylist,
            loggedIn: state => state.authentication.loginState

        })
    },
    methods: {
        ...mapActions([
            'changePlaylistLoaderState',
            'setCurrentPlaylist',
            'getCurrentUsersPlaylists',
            'loadPlaylist',
            'login'
        ]),
        loadPlaylistFromUri(uriString){
            const splitString=uriString.split(":")
            this.loadPlaylist(splitString[splitString.length-1])
            event({
                eventCategory: 'playlistInteraction',
                eventAction: 'loadPlaylistFromUri'
            })
        },
        loadPlaylistFromUser(playlistId){
            this.loadPlaylist(playlistId)
            event({
                eventCategory: 'playlistInteraction',
                eventAction: 'loadPlaylistFromUser'
            })
        },
        loginUser(){
            this.login()
            event({
                eventCategory: 'user',
                eventAction: 'login'
            })
        }
    },
    mounted: function(){
        if(this.$store.state.authentication.loginState){
            this.getCurrentUsersPlaylists()
        }
    }
}
</script>
<style scoped>
/* The Modal (background) */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 100; /* Sit on top */
  padding-top: 10%; /* Location of the box */
  padding-left: 10%;
  padding-right: 10%;
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto;
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.card {
    color: white;
    border: 2px solid white;
    background-color:rgb(37, 37, 37);
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
    border-radius: 5px;
    padding-left: 1rem;
    padding-right: 1rem;

    margin: 0.5rem;
    overflow-y: auto;
}
.close {
    grid-area: actions;
    position: sticky;
    top:0;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
    cursor: pointer;
    float: right;
    border-radius: 2px 0 0 0;
    box-shadow: -1px -1px -13px -6px rgba(0,0,0,1);
}

.playlist-box {
    display: grid;
    grid-template-columns: 400px 1fr;
    margin: 1rem;
    grid-gap: 1rem;
}

.login-box {
    min-width: 30rem;
    min-height: 20rem;
    display:grid;
}
.content {
    align-self: center;
    justify-self: center;
    display: grid;
}
</style>
