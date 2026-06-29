import { DataSet } from "vis-data";

import Experience from "./Experience"

import type { Node, Edge, Options } from "vis-network"
import { Network } from "vis-network";

export class SimpleGraphs {
  #experience = Experience.getExperience()
  #nodes: DataSet<Node>;
  #edges: DataSet<Edge>;
  #network!: Network
  public constructor() {
    this.#nodes = new DataSet<Node>([]);
    this.#edges = new DataSet<Edge>([]);

    this.update()
  }
  public update() {
    if (this.#experience.input.degreeList.length === 0) return;

    this.#nodes.clear();
    this.#edges.clear();

    const degreeList = this.#experience.input.degreeList.toSorted((a, b) => b - a);
    const n = degreeList.length;

    const nodesArray: Node[] = [];
    for (let i = 0; i < n; i++) {
      nodesArray.push({ id: i, label: `Vértice ${i} (Grau: ${degreeList[i]})` });
    }
    this.#nodes.add(nodesArray);

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

    this.#edges.add(edgesArray)

    if (this.#network) {
      this.#network.setData({ nodes: this.#nodes, edges: this.#edges })
    }
  }

  public draw() {
    const options: Options = {
      nodes: {
        shape: "dot",
        size: 16,
        color: { background: "#25A234", border: "green" },
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

    const canvas = this.#experience.canvas!

    if (this.#network) {
      this.#network.destroy()
    }

    this.#network = new Network(canvas, { nodes: this.#nodes, edges: this.#edges }, options)
    return this.#network
  }

  public eraseGraph() {
    if (this.#network) {
      this.#edges.clear()
      this.#nodes.clear()
    }
  }
}

export class Multigraphs {
  #experience = Experience.getExperience()
  #nodes: DataSet<Node>;
  #edges: DataSet<Edge>;
  #network!: Network
  public constructor() {
    this.#nodes = new DataSet<Node>([]);
    this.#edges = new DataSet<Edge>([]);

    this.update()
  }

  public update() {
    debugger
    if (this.#experience.input.degreeList.length === 0) return

    this.#nodes.clear()
    this.#edges.clear()

    const degreeList = this.#experience.input.degreeList
    const n = degreeList.length

    const nodesArray: Node[] = []
    for (let i = 0; i < n; i++) {
      nodesArray.push({ id: i, label: `Vertice ${i} Grau(${degreeList[i]})` })
    }

    this.#nodes.add(nodesArray)

    const edgesArray: Edge[] = []
    let idEdgeCounter = 0

    const addEdge = (u: number, v: number) => {
      edgesArray.push({ from: u, to: v, id: `edge_${idEdgeCounter++}` })
    }

    const verticesTarget = degreeList.map((deg, i) => ({ id: i, target: deg, current: 0 }))

    const oddDeg = verticesTarget.filter(x => x.target % 2 !== 0)
    const evenDeg = verticesTarget.filter(x => x.target % 2 === 0)

    for (let i = 0; i < oddDeg.length; i += 2) {
      const v1 = oddDeg[i]
      const v2 = oddDeg[i + 1]

      if (v1 && v2) {
        addEdge(v1.id, v2.id)
        v1.current += 1
        v2.current += 1
      }

    }

    const allVertices = [...oddDeg, ...evenDeg]

    allVertices.forEach((v) => {
      const deltaV = v.target - v.current

      if (deltaV > 0) {
        const loopsCount = deltaV / 2

        for (let j = 0; j < loopsCount; j++) {
          const t = loopsCount > 1 ? j / (loopsCount - 1) : 0;

          // 2. Aplica o Lerp para mapear 't' de [0, 1] para o intervalo [0.3, 0.9]
          const minRoundness = 0.4;
          const maxRoundness = 1;
          const roundScale = minRoundness + (maxRoundness - minRoundness) * t;

          edgesArray.push({
            id: `edge_${idEdgeCounter++}`,
            from: v.id,
            to: v.id,
            smooth: {
              enabled: true,
              type: "cubicBezier",
              roundness: roundScale,
            }
          });

          v.current += 2
        }
      }

    })

    this.#edges.add(edgesArray)

    if (this.#network) {
      this.#network.setData({ nodes: this.#nodes, edges: this.#edges })
    }
  }
  public draw() {
    const options: Options = {
      nodes: {
        shape: "dot",
        size: 16,
        color: { background: "#25A234", border: "green" },
        font: { size: 12 }
      },
      edges: {
        width: 3,
        color: { color: "#444" },
      },
      
    }

    const canvas = this.#experience.canvas!

    if (this.#network) {
      this.#network.destroy()
    }

    this.#network = new Network(canvas, { nodes: this.#nodes, edges: this.#edges }, options)
    return this.#network
  }

  public eraseGraph() {
    if (this.#network) {
      this.#edges.clear()
      this.#nodes.clear()
    }
  }

}