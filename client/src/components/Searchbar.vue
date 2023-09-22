<template>
  <div id="searchContainer">
    <div v-if="advanced" id="advanced">
      <div id="heading">
        <b>Search Graph</b>
      </div>
      <div class="input" id="advancedInput">
        <div
          id="autocompleteBox"
          @focusout="changeVisibility"
          @keydown="selectEvent"
        >
          <v-text-field
            class="searchfield"
            type="text"
            @focus="inputIsFocused = true"
            v-bind:class="{ validString: valid, invalidString: !valid }"
            ref="searchInput"
            name="searchField"
            v-model="searchString"
            @input="addCharacterInput(searchString)"
          >
            <v-icon
              class="searchIcon"
              slot="append"
              @click="startAdvancedSearch()"
              icon="mdi-magnify"
            />
          </v-text-field>
          <ul
            ref="autocomplete"
            id="autocomplete"
            v-if="getMatchingData().length > 0 && inputIsFocused"
          >
            <li
              v-for="data in getMatchingData()"
              @mousedown="addOnClick(data)"
              v-bind:key="data"
            >
              {{ data }}
            </li>
          </ul>
        </div>
      </div>
      <a @click="changeSearchMode" id="changeSearchMode">Search All</a>
    </div>
    <div v-else id="simple">
      <div id="heading">
        <b>Search All</b>
      </div>
      <div class="input" id="simpleInput" @keydown="simpleSearchEvents">
        <v-select
          dark
          :items="getSimpleSearchNodeTypes()"
          cache-items
          eager
          v-model="selectedNode"
          label="nodeType"
          id="selector"
          value="any"
          solo
        ></v-select>
        <v-text-field
          class="searchfield"
          type="text"
          name="searchField"
          id="searchField"
          v-model="simpleSearchString"
        >
          <v-icon
            class="searchIcon"
            slot="append"
            @click="
              startSimpleSearch({
                nodeType: selectedNode,
                searchString: simpleSearchString,
              })
            "
            icon="mdi-magnify"
          />
        </v-text-field>
      </div>
      <a id="changeSearchMode" @click="changeSearchMode">Search Graph</a>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState, mapGetters } from "vuex";
import { generateSearchObject } from "@/assets/js/searchObjectHelper";
export default {
  methods: {
    ...mapActions([
      "startGraphQlSearch",
      "startAdvancedGraphSearch",
      "startSimpleGraphSearch",
      "setSearchObject",
      "setSearchString",
    ]),
    ...mapGetters(["getNodeLabelNames", "getEdgeNamesForNodeLabel"]),
    changeSearchMode: function () {
      this.advanced = !this.advanced;
    },
    startAdvancedSearch: function () {
      this.startAdvancedGraphSearch({ addToSelection: false });
      this.inputIsFocused = false;
    },
    startSimpleSearch(searchObject) {
      this.startSimpleGraphSearch(searchObject);
    },
    changeVisibility: function () {
      if (this.autocompleteClicked) {
        this.autocompleteClicked = false;
        this.$refs.searchInput.focus();
      } else {
        this.inputIsFocused = false;
      }
    },
    getMatchedTypes: function (types, text) {
      return types.filter((type) =>
        type.toLowerCase().includes(text.toLowerCase())
      );
    },
    getAttributes: function (nodeType) {
      return this.schemaNodeTypes.filter(
        (schemaNodeType) => nodeType === schemaNodeType.label
      )[0]["attributes"];
    },
    getMatchingData: function () {
      if (this.tip) {
        const typesToMatch =
          this.tip.type === "attribute"
            ? this.getAttributes(this.tip.nodeType)
            : this.getNodeLabelNames();
        const matching = this.getMatchedTypes(
          typesToMatch,
          this.tip.text.trim()
        );
        if (matching.length == 1 && matching[0] === this.tip.text) {
          return [];
        }
        return matching;
      }
      return [];
    },
    addNeededQuotes(attributePart) {
      return attributePart.includes(" ") &&
        attributePart[0] !== '"' &&
        attributePart[attributePart.length - 1] !== '"'
        ? '"' + attributePart + '"'
        : attributePart;
    },
    addOnClick: function (clickedTooltip) {
      if (this.tip != undefined) {
        if (this.tip.type === "attribute") {
          const stringifiedAttributes = this.searchObject.attributes
            .filter((attribute, index) => {
              if (index == this.searchObject.attributes.length - 1) {
                return (
                  attribute.attributeSearch &&
                  attribute.attributeData &&
                  attribute.operator
                );
              }
              return true;
            })
            .map((attribute) => {
              const searchPart = this.addNeededQuotes(
                attribute.attributeSearch
              );
              const dataPart = this.addNeededQuotes(attribute.attributeData);
              return searchPart + attribute.operator + dataPart;
            });
          const stringifiedTooltip = this.addNeededQuotes(clickedTooltip) + "=";
          const stringifiedQuery =
            this.searchObject.nodeType +
            ": " +
            [...stringifiedAttributes, stringifiedTooltip].join(" ");
          this.searchString = stringifiedQuery;
          this.setSearchObject(generateSearchObject(stringifiedQuery));
        }
        if (this.tip.type === "nodeType") {
          this.searchString = clickedTooltip;
          this.setSearchObject(generateSearchObject(clickedTooltip));
        }
      }
      this.autocompleteClicked = true;
    },
    moveToNext: function () {
      if (this.$refs.autocomplete) {
        if (this.selectedItem + 1 < this.$refs.autocomplete.childNodes.length) {
          if (this.selectedItem != -1) {
            this.$refs.autocomplete.childNodes[this.selectedItem].className =
              "";
          }
          this.selectedItem++;
          this.$refs.autocomplete.childNodes[this.selectedItem].className =
            "selected";
          this.$refs.autocomplete.childNodes[this.selectedItem].scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        }
      }
    },
    moveToPrevious: function () {
      if (this.$refs.autocomplete) {
        if (this.selectedItem != -1) {
          this.$refs.autocomplete.childNodes[this.selectedItem].className = "";
          this.selectedItem--;
          if (this.selectedItem != -1) {
            this.$refs.autocomplete.childNodes[this.selectedItem].className =
              "selected";
            this.$refs.autocomplete.childNodes[
              this.selectedItem
            ].scrollIntoView({ block: "end", behavior: "smooth" });
          }
        }
      }
    },
    useSelected: function () {
      if (this.$refs.autocomplete && this.selectedItem != -1) {
        this.addOnClick(
          this.$refs.autocomplete.childNodes[this.selectedItem].innerText
        );
      } else {
        this.startAdvancedSearch();
      }
    },
    selectEvent: function (event) {
      switch (event.keyCode) {
        case 38:
          this.moveToPrevious();
          break;
        case 40:
          this.moveToNext();
          break;
        case 13:
          this.useSelected();
          break;
      }
    },
    simpleSearchEvents: function (event) {
      if (event.keyCode == 13) {
        this.startSimpleSearch({
          nodeType: this.selectedNode,
          searchString: this.simpleSearchString,
        });
      }
    },
    addCharacterInput: function (searchString) {
      this.selectedItem = -1;
      if (this.$refs.autocomplete) {
        this.$refs.autocomplete.childNodes.forEach((listItem) => {
          listItem.className = "";
        });
      }
      this.setSearchObject(generateSearchObject(searchString));
    },
    getSimpleSearchNodeTypes: function () {
      const nodeNames = this.getNodeLabelNames();
      return ["any", ...nodeNames];
    },
  },
  data: () => ({
    simpleSearchString: "",
    searchString: "",
    advanced: false,
    selectedNode: "any",
    inputIsFocused: false,
    autocompleteClicked: false,
    selectedItem: -1,
  }),
  computed: {
    ...mapState({
      valid: (state) => state.searchObject.valid,
      tip: (state) => state.searchObject.tip,
      searchObject: (state) => state.searchObject,
      schemaNodeTypes: (state) => state.schema.nodeTypes,
    }),
  },
  watch: {
    searchString: function (newValue, oldValue) {
      this.setSearchString(newValue);
    },
  },
};
</script>
<style scoped>
#searchContainer {
  font-family: "Roboto", sans-serif;
  width: 100%;
}
.v-text-field {
  caret-color: #da6a1d !important;
}
#advanced {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-column-gap: 1rem;
  grid-template-areas: "heading input changeMode";
  align-items: center;
}
#simple {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-column-gap: 1rem;
  grid-template-areas: "heading input changeMode";
  align-items: center;
}
#heading {
  grid-area: heading;
  text-align: center;
  justify-self: right;
}
.input {
  grid-area: input;
  display: grid;
  grid-gap: 1rem;
  min-width: 300px;
}
#simpleInput {
  grid-template-columns: 1fr 2fr;
}
#advancedInput {
  grid-template-columns: 1fr;
}
#changeSearchMode {
  grid-area: changeMode;
  color: lightblue;
}
button {
  border: 1px solid white;
}
#autocomplete {
  list-style: none;
  text-align: left;
  cursor: pointer;
  background-color: white;
  color: black;
  max-height: 30vh;
  overflow-y: auto;
  position: fixed;
  border: none;
  z-index: 10;
}
li {
  padding: 1rem;
}
li:hover {
  background-color: #f0f0f0;
}
ul {
  padding: 0;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
#autocompleteBox {
  display: inline-block;
}
.validString {
  color: green !important;
}
.invalidString {
  color: red !important ;
}
.selected {
  color: #da6a1d;
}
.searchIcon:hover {
  color: #da6a1d;
}
:deep() .v-input__control {
  min-height: 30px !important;
  max-height: 40px;
  align-self: center;
}
:deep() .v-input__control .v-input__slot {
  margin: 0;
}
.searchfield {
  padding: 0;
  margin: 0;
}
</style>
