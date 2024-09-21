import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

const DAGGraph = (props) => {
    const svgRef = useRef(null);
  
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
  
        const g = svg.append("g");
  
        const graph = new dagreD3.graphlib.Graph().setGraph({ 
            rankdir: 'LR',
            ranksep: 35,     // Reduce vertical space between nodes
            nodesep: 10      // Adjust horizontal space if necessary (optional)
        });
  
        graph.setDefaultNodeLabel(() => ({}));
  
        // Add nodes with smaller size and explicitly no label
        props.data.forEach((block) => {
            if (!block.id) {
                console.error('Block ID is undefined');
                return;
            }
            graph.setNode(block.id, {
                width: 2, 
                height: 2,
                shape: 'rect',
                style: 'fill: #0f5b5c; stroke: #11646699;',
                label: '', 
            });
        });
  
      // Add edges
      props.data.forEach(block => {
        if (block.parents) {
          block.parents.forEach(parent => {
            if (graph.hasNode(parent) && graph.hasNode(block.id)) {
              graph.setEdge(parent, block.id, {
                style: 'stroke: #11646699; fill: none;',
                arrowheadStyle: 'fill: #11646699'
              });
            }
          });
        }
      });
  
      // Renderer setup and graph drawing code remains the same
  
      // Create the renderer
      const render = new dagreD3.render();

    // Configure the render to not render node labels
    render.shapes().rect = function(parent, bbox, node) {
      const w = bbox.width,
            h = bbox.height;
      const rect = parent.insert("rect", ":first-child")
        .attr("rx", 15) // Rounded corners
        .attr("ry", 15)
        .attr("x", -w/2)
        .attr("y", -h/2)
        .attr("width", w)
        .attr("height", h);
      node.intersect = function(point) {
        return dagreD3.intersect.rect(node, point);
      };
      return rect;
    };

    // Run the renderer without any label rendering
    render(g, graph);

    // Center the graph
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;
    const graphWidth = graph.graph().width;
    const graphHeight = graph.graph().height;
    const xCenterOffset = (svgWidth - graphWidth) / 2;
    const yCenterOffset = (svgHeight - graphHeight) / 2;
    g.attr("transform", `translate(${xCenterOffset}, ${yCenterOffset})`);

  }, [props.data]); // Added props.data to the dependency array

  return (
    <div style={{ width: '100%', height: '600px', overflow: 'auto' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ background: 'rgb(44, 53, 49)' }}></svg>
    </div>
  );
};

export default DAGGraph;