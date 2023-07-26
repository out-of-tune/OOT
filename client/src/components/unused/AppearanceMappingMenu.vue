<template>
  <div class="text-xs-center popover">
    <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="100">
      <template v-slot:activator="{ on }">
        <button class="container" v-on="on">
          <v-icon class="icon" color="white" icon="mdi-brush"/>
        </button>
      </template>

      <v-card class="menu">
        <h2 id="menu-header">Appearance Mapping</h2>

        <v-divider></v-divider>

        <v-card-actions id="actions">
          <div class="field">
            <label for="color">color </label>
            <input id="color" type="color" v-model="color">
            <button class="add" v-on:click="addColorRule">add</button>
          </div>
          <div class="field">
            <label for="size">size </label>
            <input id="size" type="number" v-model="size">
            <button class="add" v-on:click="addSizeRule">add</button>
          </div>
          <div class="field">
              map
            <label class="label" for="min">min</label>
            <input id="min" type="number" v-model="min">
            <label class="label" for="max">max</label>
            <input id="max" type="number" v-model="max">
            <button class="add" v-on:click="addMapSizeRule">add</button>
          </div>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>
<script>
import {mapActions, mapState} from 'vuex'
export default {
  data: () => ({
    menu: false,
    color: "#ffffff",
    size: 10,
    min: 10,
    max: 50
  }),
  computed: {
    ...mapState({
      searchObject: state => state.searchObject,
      searchString: state => state.searchString
    })
  },
  methods: {
    addColorRule: function() {
      const color = this.color.substring(1) + "ff"
      this.addRule({ type: "color", searchObject: this.searchObject, searchString: this.searchString, color })
    },
    addSizeRule: function() {
      const size = parseInt(this.size);
      if(Number.isInteger(size)){
        this.addRule({ type: "size", searchObject: this.searchObject, searchString: this.searchString, sizeType: "compare", size });
      }
      else {
        this.setError(new Error("rule could not be added: size is invalid"))
      }
    },
    addMapSizeRule: function() {
      const min = parseInt(this.min);
      const max = parseInt(this.max);
      if(Number.isInteger(min)&&Number.isInteger(max)){
        this.addRule({ type: "size", searchObject: this.searchObject, searchString: this.searchString, sizeType: "map", min, max })
      }
      else {
        this.setError(new Error("rule could not be added: min/max values are invalid"))
      }
    },
    ...mapActions(["addRule"])
  }
};
</script>
<style scoped>
    #actions {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1rem;
    }
    .field {
        display: grid;
        grid-gap: 0.5rem;
        grid-template-columns: 50px 30px 60px 30px 60px 60px;
    }
    .add {
        grid-column-start: 6;
    }
    .label {
    }
    #size {
        grid-column-start: span 2;
    }
    h2 {
        padding: 0.5rem;
    }
</style>


