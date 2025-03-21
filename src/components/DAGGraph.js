import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3";

const DAGGraph = ({ DAG }) => {
  const svgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const graph = new dagreD3.graphlib.Graph().setGraph({
      rankdir: "LR",
      ranksep: 100,
      nodesep: 5,
      edgesep: 0,
      ranker: "longest-path",
      marginx: 0,
      marginy: 0,
    });

    graph.setDefaultNodeLabel(() => ({}));

    // Add nodes
    DAG.forEach((block) => {
      if (!block.hash) {
        return;
      }

      const labelText = block.hash;
      const maxLabelLength = 8;
      const shortLabel = labelText.length > maxLabelLength ? labelText.slice(0, maxLabelLength - 3) + "..." : labelText;

      const children = block.children
        .map((childHash) => DAG.find((b) => b.hash === childHash))
        .filter((childBlock) => childBlock !== undefined);

      const isInChildrenMergeSetRedsHashes = children.some(
        (child) => child.redparents && child.redparents.includes(block.hash)
      );
      if (!isInChildrenMergeSetRedsHashes) {
        graph.setNode(block.hash, {
          hash: block.hash,
          width: 30,
          height: 30,
          shape: "rect",
          style: block.isChain
            ? "fill: #116466; stroke: #116466; cursor: pointer;"
            : "fill: #661311; stroke: #661311; cursor: pointer;",
          label: shortLabel,
          labelStyle: "font-size: 12px; fill: #fff;",
        });
      }
    });

    // Add edges (non-selected first)
    DAG.forEach((block) => {
      const children = block.children
        .map((childHash) => DAG.find((b) => b.hash === childHash))
        .filter((childBlock) => childBlock !== undefined);
      const isInChildrenMergeSetRedsHashes = children.some(
        (child) => child.redparents && child.redparents.includes(block.hash)
      );
      if (!isInChildrenMergeSetRedsHashes) {
        if (block.redparents) {
          block.redparents.forEach((parent) => {
            if (graph.hasNode(parent) && graph.hasNode(block.hash)) {
              if (!graph.hasEdge(parent, block.hash)) {
                graph.setEdge(parent, block.hash, {
                  style: "stroke: #5E1210; fill: none; stroke-width: 2px;",
                  arrowheadStyle: "fill: #5E1210; stroke-width: 2px;",
                });
              }
            }
          });
        }
        if (block.blueparents) {
          block.blueparents.forEach((parent) => {
            if (graph.hasNode(parent) && graph.hasNode(block.hash)) {
              if (!graph.hasEdge(parent, block.hash)) {
                if (parent !== block.selectedParent) {
                  graph.setEdge(parent, block.hash, {
                    style: "stroke: #3f4d46; fill: none; stroke-width: 2px;",
                    arrowheadStyle: "fill: #3f4d46; stroke-width: 2px;",
                  });
                }
              }
            }
          });
        }
      }
    });

    // Add selected edges (#17888A) last to ensure they are on top
    DAG.forEach((block) => {
      if (block.blueparents) {
        block.blueparents.forEach((parent) => {
          if (parent === block.selectedParent && graph.hasNode(parent) && graph.hasNode(block.hash)) {
            if (!graph.hasEdge(parent, block.hash)) {
              graph.setEdge(parent, block.hash, {
                style: "stroke: #17888A; fill: none; stroke-width: 2px;",
                arrowheadStyle: "fill: #17888A; stroke-width: 2px;",
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
    var graphWidth = graph.graph().width;
    var graphHeight = graph.graph().height;
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;

    var scaleVertical = Math.min(svgWidth / graphWidth, 1);
    var scaleHorizontal = Math.min(svgHeight / graphHeight, 1);
    const scale = Math.max(Math.min(scaleHorizontal, scaleVertical, 1), 0.75);
    let xOffset = Math.min(svgWidth - graphWidth * scale, 0);
    const yOffset = (svgHeight - graphHeight * scale) / 2;
    g.attr("transform", `translate(${xOffset}, ${yOffset}) scale(${scale})`);
    svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  }, [DAG]);

  return (
    <div
      style={{
        width: "calc(100% - 25px)",
        height: "800px",
        overflow: "auto",
        marginRight: "25px",
        marginTop: "25px",
        marginBottom: "25px",
      }}
    >
      <svg ref={svgRef} width="100%" height="100%" style={{ background: "rgb(44, 53, 49)" }}></svg>
    </div>
  );
};

export default DAGGraph;
