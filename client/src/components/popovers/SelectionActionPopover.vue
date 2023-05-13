<template>
    <div class="text-xs-center popover">
      <v-menu dark v-model="menu" :close-on-content-click="false" :nudge-width="100">
        <template v-slot:activator="{ on }">
          <button class="container action tooltip" v-on="on"><v-icon class="icon" color="white">select_all</v-icon>
          <span class="tooltiptext">SELECTION</span></button>
        </template>

        <v-card class="menu">
          <h2 id="menu-header">Selection Actions</h2>

          <v-divider></v-divider>

          <div>
            <v-spacer></v-spacer>
            <div class="actions">
              <v-btn dark small outline class="btn" @click="collapse">Collapse</v-btn>
              <v-btn dark small outline class="btn" @click="expand">Expand</v-btn>

              <v-btn dark small outline class="btn" @click="remove">Remove</v-btn>
              <v-btn dark small outline class="btn" @click="pin(selectedNodes)">Pin</v-btn>
              <v-btn dark small outline class="btn" @click="unpin(selectedNodes)">Unpin</v-btn>
              <v-btn dark small outline class="btn" @click="invert">Invert</v-btn>
              <v-btn dark small outline class="btn" @click="sortNodes">sort</v-btn>
              <v-btn dark small outline class="btn" @click="addToQueue">Add to queue</v-btn>
              <v-btn dark small outline class="btn" @click="openPlaylistChooser">Add to playlist</v-btn>
            </div>
            <v-btn small class="btn-orange" @click="showItems">show items</v-btn>
          </div>
        </v-card>
      </v-menu>
    </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { getNodePosition} from "@/assets/js/graphHelper"

export default {
    data: ()=>{
      return{
        menu: false,
    }},
    methods: {
      ...mapActions([
        "changeSelectionModalState",
        "changePlaylistChooserState",
        "expandSelectedNodes",
        "collapseSelectedNodes",
        "removeSelectedNodes",
        "addSelectedSongsToQueue",
        "pinNodes",
        "unpinNodes",
        "invertSelection",
        "applyNodeCoordinateSystemLine"
      ]),
      collapse(){
        this.collapseSelectedNodes()
      },
      expand(){
        this.expandSelectedNodes()
      },
      remove(){
        this.removeSelectedNodes()
      },
      openPlaylistChooser(){
        this.changePlaylistChooserState(true)
      },
      pin(selectedNodes){
        this.pinNodes(selectedNodes)
      },
      unpin(selectedNodes){
        this.unpinNodes(selectedNodes)
      },
      invert(){
        this.invertSelection()
      },
      sortNodes(){
        const pos = getNodePosition(this.$store.state, this.selectedNodes[0])
        this.applyNodeCoordinateSystemLine({xOffset: pos.x, yOffset: pos.y})
      },
      addToQueue(){
        this.addSelectedSongsToQueue()
      },
      showItems(){
        this.changeSelectionModalState()
      }
    },
    computed: {
      ...mapState({
        selectedNodes: state => state.selection.selectedNodes
      })
    }
}
</script>
<style scoped>
.popover {
  background-color: #252525;
}

.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}

.tooltip .tooltiptext {
  visibility: hidden;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  background-color: #0d676d;
 
  position: absolute;
  z-index: 1;
  top: -1px;
  right: 110%;
}

.container:hover {
  background-color: #1dcdda66;
}

.container:active {
  background-color: #1dcddaff;
}

.container {
  background-color: #da6a1dff;
  padding: 3px;
  cursor: pointer;
  height: 30px;
  align-self: flex-start;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.menu {
  padding: 1rem;
}

/* .btn {
    background: #FFFFFF;
    border: 1px solid #2D9CDB;
    box-sizing: border-box;
    box-shadow: 1px 1px 4px rgba(45, 156, 219, 0.25);
    border-radius: 5px;
    padding: 3px;
    margin-right: 1rem;
    width: 100px;
    margin-bottom: 1rem;
} */

/* .btn-orange {
    background: #FFFFFF;
    border: 1px solid #F2994A;
    box-sizing: border-box;
    box-shadow: 1px 1px 4px rgba(242, 152, 74, 0.25);
    border-radius: 5px;
    padding: 3px;
    margin-right: 1rem;
    width: 100px;
    margin-bottom: 1rem;
}

.btn-orange:hover {
    background: linear-gradient(180deg, #F2994A 0%, rgb(240, 131, 35) 100%);    
    color: white;
}

.btn:active {
    background: #2D9CDB;
}

.btn:hover {
    background: linear-gradient(180deg, #2D9CDB 0%, #56CCF2 100%);    
    color: white;
} */

</style>
