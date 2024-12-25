import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";

const DAGGraph = (props) => {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "LR",
      ranksep: 30,
      nodesep: 0,
      edgesep: 15,
      align: "DR",
      ranker: "tight-tree",
      marginx: 15,
      acyclicer: "greedy",
    });

    graph.setDefaultNodeLabel(() => ({}));

    // Add nodes
    props.data.forEach((block) => {
      if (!block.id) {
        console.error("Block ID is undefined");
        return;
      }

      const labelText = block.id;
      const maxLabelLength = 8;
      const shortLabel =
        labelText.length > maxLabelLength
          ? labelText.slice(0, maxLabelLength - 3) + "..."
          : labelText;

      graph.setNode(block.id, {
        hash: block.id,
        width: 60,
        height: 60,
        shape: "rect",
        style: block.isChain
          ? "fill: #116466; stroke: #116466; cursor: pointer;"
          : "fill: #661311; stroke: #661311; cursor: pointer;",
        label: shortLabel,
        labelStyle: "font-size: 20px; fill: #fff;",
      });
    });

    // Add edges
    props.data.forEach((block) => {
      if (block.redparents) {
        block.redparents.forEach((parent) => {
          if (graph.hasNode(parent) && graph.hasNode(block.id)) {
            if (!graph.hasEdge(parent, block.id)) {
              graph.setEdge(parent, block.id, {
                style: "stroke: #5E1210; fill: none; stroke-width: 2px;",
                arrowheadStyle: "fill: #5E1210; stroke-width: 2px;",
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
                style: "stroke: #105D5E; fill: none; stroke-width: 2px;",
                arrowheadStyle: "fill: #105D5E; stroke-width: 2px;",
              });
            }
          }
        });
      }
    });

    const render = new dagreD3.render();

    render.shapes().rect = function (parent, bbox, node) {
      const w = bbox.width,
        h = bbox.height;
      const rect = parent
        .insert("rect", ":first-child")
        .attr("rx", 15)
        .attr("ry", 15)
        .attr("x", -w / 2)
        .attr("y", -h / 2)
        .attr("width", w)
        .attr("height", h)
        .on("click", () => {
          navigate(`/blocks/${node.hash}`);
        });
      node.intersect = function (point) {
        return dagreD3.intersect.rect(node, point);
      };
      return rect;
    };

    render(g, graph);

    // Calculate scaling and translation
    var graphWidth = graph.graph().width + 25;
    var graphHeight = graph.graph().height + 50;
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;

    var scale = Math.min(svgWidth / graphWidth, svgHeight / graphHeight, 1);
    console.log(`scale ${scale}`);
    while (scale < 0.7 && scale > 0) {
      graph.removeNode(graph.nodes().shift());
      render(g, graph);
      graphWidth = graph.graph().width + 25;
      graphHeight = graph.graph().height + 50;
      scale = Math.min(svgWidth / graphWidth, svgHeight / graphHeight, 1);
      console.log(`rerender scale ${scale}`);
    }

    const xOffset = (svgWidth - graphWidth * scale) / 2;
    const yOffset = (svgHeight - graphHeight * scale) / 2;

    g.attr("transform", `translate(${xOffset}, ${yOffset}) scale(${scale})`);
    svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  }, [props.data]);

  return (
    <div
      style={{
        width: "calc(100% - 25px)",
        height: "450px",
        overflow: "auto",
        marginRight: "25px",
        marginTop: "25px",
        marginBottom: "25px",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ background: "rgb(44, 53, 49)" }}
      ></svg>
    </div>
  );
};

export default DAGGraph;
