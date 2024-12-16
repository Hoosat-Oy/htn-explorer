import React, { useEffect, useRef,  } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

const DAGGraph = (props) => {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'LR',  // Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
      ranksep: 75,    // Number of pixels between each rank in the layout.
      nodesep: 5,     // Number of pixels that separate nodes horizontally in the layout.
      edgesep: 15,    // Number of pixels that separate edges horizontally in the layout.
    });

    graph.setDefaultNodeLabel(() => ({}));

    // Add nodes with smaller size and explicitly no label
    props.data.forEach((block) => {
      if (!block.id) {
        console.error('Block ID is undefined');
        return;
      }

      const labelText = block.id;
      const maxLabelLength = 8;  // Adjust this as needed
      const shortLabel = labelText.length > maxLabelLength
        ? labelText.slice(0, maxLabelLength - 3) + '...'
        : labelText;

      graph.setNode(block.id, {
        hash: block.id,
        width: 30,
        height: 30,
        shape: 'rect',
        style: block.isChain
          ? 'fill: #116466; stroke: #116466; cursor: pointer;'
          : 'fill: #661311; stroke: #661311; cursor: pointer;',
        label: shortLabel,
        labelStyle: "font-size: 12px; fill: #fff;"
      });
    });

    // Add edges
    props.data.forEach((block) => {
      if (block.redparents) {
        block.redparents.forEach((parent) => {
          if (graph.hasNode(parent) && graph.hasNode(block.id)) {
            if (!graph.hasEdge(parent, block.id)) {
              graph.setEdge(parent, block.id, {
                style: 'stroke: #5E1210; fill: none; stroke-width: 2px;',
                arrowheadStyle: 'fill: #5E1210; stroke-width: 2px;',
              });
            }
          }
        });
      }
      if (block.blueparents) {
        block.blueparents.forEach((parent) => {
          if (graph.hasNode(parent) && graph.hasNode(block.id)) {
            if (!graph.hasEdge(parent, block.id)) {
              graph.setEdge(parent, block.id, {
                style: 'stroke: #105D5E; fill: none; stroke-width: 2px;',
                arrowheadStyle: 'fill: #105D5E; stroke-width: 2px;',
              });
            }
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
        .on('click', () => {
          navigate(`/blocks/${node.hash}`);
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

    let leftShift = svgWidth / 24;
    if (graphWidth > svgWidth) {
      leftShift = (graphWidth - svgWidth) + leftShift;
    }
    const xCenterOffset = -leftShift;
    const yCenterOffset = (svgHeight - graphHeight) / 2;
    g.attr('transform', `translate(${xCenterOffset.toFixed(2)}, ${yCenterOffset.toFixed(2)})`);
    svg.attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

  }, [props.data]);

  return (
    <div style={{ width: '100%', height: '400px', overflow: 'auto' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ background: 'rgb(44, 53, 49)' }}></svg>
    </div>
  );
};

export default DAGGraph;
