export default {
  steps: [
    //GENERAL
    //
    {
      target: ".topbar",
      content:
        "Out-of-tune shows you the world of music as a graph. Each dot represents either an artist, genre, album or song.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: ".search",
      content:
        "Start by searching for an artist, song, album or genre! The result will be added to the graph.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: ".topbar",
      content:
        "You are able to click on every node, select multiple of them, move them,...",
      params: {
        placement: "bottom",
      },
    },
    {
      target: ".topbar",
      content:
        "If the graph is moving too fast, you can press SPACEBAR to pause all motion.",
      params: {
        placement: "bottom",
      },
    },
    // START TOOLBAR
    // Mouse actions
    {
      target: "#MouseActionRadio",
      content:
        "You can choose what happens when you click on a node. You can switch between expand, collapse and explore.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: "#expand-button",
      content: "New nodes and edges will be added if you are in expand mode.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: "#collapse-button",
      content:
        "Connected nodes will be removed when you are in collapse mode. You can use this mode to delete unwanted connections.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: "#explore-button",
      content:
        "You will see changes in the node info box when you are in explore mode, but the graph itself won't change.",
      params: {
        placement: "bottom",
      },
    },
    {
      target: "#undo-button",
      content: "Undo your last action.",
      params: {
        placement: "top",
      },
    },
    {
      target: "#redo-button",
      content: "Redo your last action.",
      params: {
        placement: "top",
      },
    },
    {
      target: "#selection-button",
      content:
        "Select nodes via the search or SHIFT + DRAG. You are able to move the selected nodes and position them as you like! You can also perform lots of other actions, check them out!",
      params: {
        placement: "top",
      },
    },
    {
      target: "#playlists-button",
      content:
        "Visualize your Spotify Playlists - log in to your Spotify account to load and edit your playlists!",
      params: {
        placement: "top",
      },
    },
    {
      target: "#io-button",
      content:
        "Store and load your graphs and configurations here, to re-use them later.",
      params: {
        placement: "top",
      },
    },
    {
      target: "#settings-button",
      content:
        "You can change the appearance of the graph in the settings, but beware: It is rather technical, so you might want to look at the help page.",
      params: {
        placement: "top",
      },
    },
    {
      target: "#help-button",
      content:
        "If you want to look up some other keyboard shortcuts, or if you need further assistance, visit the help page.",
      params: {
        placement: "top",
      },
    },
    {
      target: "#feedback-button",
      content: "We would be delighted if you leave some feedback!",
      params: {
        placement: "top",
      },
    },
    {
      target: "#share-button",
      content:
        "In case you want to share your findings with your friends click here.",
      params: {
        placement: "top",
      },
    },
    {
      target: ".nodeInfo",
      content:
        "Data of the last clicked node will be shown here. Interact with the content of the box - listen to a song, add them to the queue, ...",
      params: {
        placement: "bottom",
      },
    },
    {
      target: ".topbar",
      content: "Thank you for using out-ouf-tune <3",
      params: {
        placement: "bottom",
      },
    },
  ],
};
