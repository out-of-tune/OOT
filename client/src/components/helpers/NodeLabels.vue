<script>
export default {
  props: ["items"],
  render(createElement) {
    if (this.items.length) {
      return createElement(
        "div",
        this.items.map(function(nodeLabel) {
          return createElement("span",{
                style: {
                    left: nodeLabel.coordinates.x+'px', 
                    top: nodeLabel.coordinates.y+'px',
                    color: nodeLabel.colors.textColor,
                    backgroundColor: nodeLabel.colors.backgroundColor,
                    position: 'absolute',
                    cursor: 'default',
                    padding: '3px',
                    border: '1px solid white',
                    maxWidth: '100px',
                    pointerEvents: 'none',
                    hyphens: 'auto'
                },
                
            }, nodeLabel.data[nodeLabel.dataKey? nodeLabel.dataKey: "name"]);
        })
      );
    } else {
      return createElement("div", "");
    }
  }
};
</script>
