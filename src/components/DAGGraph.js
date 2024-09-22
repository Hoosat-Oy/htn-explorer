import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

const DAGGraph = (props) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'LR',
      ranksep: 35, // Reduce vertical space between nodes
      nodesep: 5, // Adjust horizontal space if necessary (optional)
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
        style: block.isChain
          ? 'fill: #116466; stroke: #116466;'
          : 'fill: #661311; stroke: #661311;',
        label: '',
      });
    });

    // Add edges
    props.data.forEach((block) => {
      if (block.blueparents) {
        block.blueparents.forEach((parent) => {
          if (graph.hasNode(parent) && graph.hasNode(block.id)) {
            graph.setEdge(parent, block.id, {
              style: 'stroke: #116466; fill: none;',
              arrowheadStyle: 'fill: #116466',
            });
          }
        });
      }
    });

    // Create the renderer
    const render = new dagreD3.render();

    // Custom render for nodes with rounded rectangles
    render.shapes().rect = function (parent, bbox, node) {
      const w = bbox.width,
        h = bbox.height;
      const rect = parent
        .insert('rect', ':first-child')
        .attr('rx', 15) // Rounded corners
        .attr('ry', 15)
        .attr('x', -w / 2)
        .attr('y', -h / 2)
        .attr('width', w)
        .attr('height', h)
        .on('click', (d, i) => {
          console.log('click', d, i);
        });
      node.intersect = function (point) {
        return dagreD3.intersect.rect(node, point);
      };
      return rect;
    };

    // Run the renderer
    render(g, graph);

    // Automatic scaling if the graph doesn't fit
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;
    const graphWidth = graph.graph().width;
    const graphHeight = graph.graph().height;
    const leftShift = svgWidth / 10

    // Calculate if scaling is needed
    if (graphWidth > svgWidth || graphHeight > svgHeight) {
      const scale = Math.min(svgWidth / graphWidth, svgHeight / graphHeight);
      const xCenterOffset = (svgWidth - graphWidth * scale) / 2 - leftShift;
      const yCenterOffset = (svgHeight - graphHeight * scale) / 2;
      
      // Apply transformation to scale and center the graph
      g.attr('transform', `translate(${xCenterOffset}, ${yCenterOffset}) scale(${scale})`);
    } else {
      // Center the graph if no scaling is needed
      const xCenterOffset = (svgWidth - graphWidth) / 2 - leftShift;
      const yCenterOffset = (svgHeight - graphHeight) / 2;
      
      // Apply translation to center the graph
      g.attr('transform', `translate(${xCenterOffset}, ${yCenterOffset})`);
    }

    // Set viewBox for responsive scaling
    svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

  }, [props.data]);

  return (
    <div style={{ width: '100%', height: '540px', overflow: 'auto' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ background: 'rgb(44, 53, 49)' }}></svg>
    </div>
  );
};

export default DAGGraph;
