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
    if (this._experience.input.degreeList.length === 0) return

    this._nodes.clear()
    this._edges.clear()

    const n = this._experience.input.degreeList.length
    console.log(this._experience.input.degreeList)

    const nodesArray: Node[] = []
    for (let i = 0; i < n; i++) {
      nodesArray.push({ id: i, label: `Vertice ${i} Grau ${this._experience.input.degreeList[i]}` })
    }
    this._nodes.add(nodesArray)
    const degreeList = this._experience.input.degreeList
    console.log(`degreeList ${degreeList}`)

    let verticesControls = degreeList.map((grau, i) => ({ id: i, grau }))
    const edgesArray: Edge[] = []

    while (true) {
      verticesControls.sort((a, b) => b.grau - a.grau)

      if (verticesControls[0].grau === 0) break

      const curr = verticesControls.shift()!

      for (let i = 0; i < curr.grau; i++) {
        verticesControls[i].grau--

        edgesArray.push({
          from: curr?.id,
          to: verticesControls[i].id
        })

      }
    }

    this._edges.add(edgesArray)

    if(this._network){
      this._network.setData({nodes: this._nodes, edges: this._edges})
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
      },
      physics: {
        enabled: true,
        barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 95 }
      }
    }

    const canvas = this._experience.canvas!
    
    if(this._network){
      this._network.destroy()
    }
    
    this._network = new Network(canvas, { nodes: this._nodes, edges: this._edges }, options)
    return this._network
  }

  public eraseGraph(){
    if(this._network){
      this._network.destroy()
    }
  }
}