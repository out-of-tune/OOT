<script>
import { h } from 'vue'
export default {
  props: ["items"],
  render() {
    if (this.items.length) {
      return h(
        "div",
        this.items.map(function(nodeLabel) {
          return h("span",{
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
      return h("div", "");
    }
  }
};
</script>
