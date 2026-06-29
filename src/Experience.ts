import Input from "./Input"
import Graphs from "./Graphs"

export default class Experience {
  private static _instance: Experience

  canvas = document.querySelector<HTMLCanvasElement>("#vis")
  public input!: Input
  public graphs!: Graphs
  
  private constructor(){
    if (Experience._instance){
      return Experience._instance
    }
    Experience._instance = this

    if (!this.canvas) {
      throw Error("Canvas não reconhecido")
    }

    this.input = new Input()
    this.graphs = new Graphs()

    console.log("Passou do graph e input")

    this.input.on("update", () => {
      console.log("EventEmitter update")
      this.update()
    })
  }

  public static getExperience(){
    if(!Experience._instance)  {
      Experience._instance =  new Experience()
    }

    return Experience._instance
  }

  public update(){
    console.log("Updated graph")
    if(this.input.isMultigraphSequence()){
      if (this.input.isSimpleGraphSequence()){
        this.graphs.update()
        this.graphs.drawGraph()
        return 
      } 


    }

    this.graphs.eraseGraph() 
  }

}
