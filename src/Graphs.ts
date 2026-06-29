import { DataSet } from "vis-data";

import Experience from "./Experience"

import type { Node, Edge, Options } from "vis-network"
import { Network } from "vis-network";

export default class Graphs {
  private _experience = Experience.getExperience()
  private _nodes: DataSet<Node>;
  private _edges: DataSet<Edge>;
  private _network!: Network
  public constructor() {
    this._nodes = new DataSet<Node>([]);
    this._edges = new DataSet<Edge>([]);

    this.update()
  }
  public update() {
    if (this._experience.input.degreeList.length === 0) return;

    this._nodes.clear();
    this._edges.clear();

    const degreeList = this._experience.input.degreeList.toSorted((a, b) => b - a);
    const n = degreeList.length;

    const nodesArray: Node[] = [];
    for (let i = 0; i < n; i++) {
      nodesArray.push({ id: i, label: `Vértice ${i} (Grau: ${degreeList[i]})` });
    }
    this._nodes.add(nodesArray);

    let edgesArray: Edge[] = [];

    const getDegree = (u: number): number => {
      return edgesArray.filter(e => e.from === u || e.to === u).length;
    };

    const hasEdge = (u: number, v: number): boolean => {
      return edgesArray.some(e => (e.from === u && e.to === v) || (e.from === v && e.to === u));
    };

    const addEdge = (u: number, v: number) => {
      if (!hasEdge(u, v) && u !== v) {
        edgesArray.push({ from: u, to: v });
      }
    };

    const removeEdge = (u: number, v: number) => {
      edgesArray = edgesArray.filter(e => !((e.from === u && e.to === v) || (e.from === v && e.to === u)));
    };

    let r = 0;
    while (r < n) {
      const dr = degreeList[r];
      const dvr = getDegree(r);
      const deltaR = dr - dvr

      if (deltaR === 0) {
        r++;
        continue;
      }

      let isModified = false;

      for (let i = 0; i < n; i++) {
        if (i !== r && !hasEdge(r, i) && getDegree(i) < degreeList[i]) {
          addEdge(r, i);
          isModified = true;
          break;
        }
      }
      if (isModified) continue;

      for (let i = 0; i < r; i++) {
        if (!hasEdge(r, i)) {
          const u = edgesArray.find((e) => {
            if (e.from === i && e.to !== r && !hasEdge(e.to as number, r)) return true;
            if (e.to === i && e.from !== r && !hasEdge(e.from as number, r)) return true;
            return false;
          });

          if (u) {
            const Nu = u.from === i ? (u.to as number) : (u.from as number);
            removeEdge(i, Nu);
            addEdge(Nu, r);
            addEdge(i, r);
            isModified = true;
            break;
          }
        }
      }

      if (isModified) continue;

      if (!isModified) {
        r++
      }
    }

    this._edges.add(edgesArray)

    if (this._network) {
      this._network.setData({ nodes: this._nodes, edges: this._edges })
    }
  }

  public drawGraph() {
    const options: Options = {
      nodes: {
        shape: "dot",
        size: 16,
        color: { background: "#97C2FC", border: "#2B7CE9" },
        font: { size: 12 }
      },
      edges: {
        width: 3,
        color: { color: "#444" },
        smooth: {
          enabled: true,
          type: "dynamic",
          roundness: 0.5
        }
      },
      physics: {
        enabled: true,
        solver: "repulsion",
        repulsion: {
          nodeDistance: 150,
          centralGravity: 0.2
        }
      }
    }

    const canvas = this._experience.canvas!

    if (this._network) {
      this._network.destroy()
    }

    this._network = new Network(canvas, { nodes: this._nodes, edges: this._edges }, options)
    return this._network
  }

  public eraseGraph() {
    if (this._network) {
      this._edges.clear()
      this._nodes.clear()
    }
  }
}