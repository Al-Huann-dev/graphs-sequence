import Input from "./Input"
import {SimpleGraphs, Multigraphs} from "./Graphs"

export default class Experience {
  private static _instance: Experience

  canvas = document.querySelector<HTMLCanvasElement>("#vis")
  public input!: Input
  public simpleGraphs!: SimpleGraphs
  public multigraphs!: Multigraphs
  
  private constructor(){
    if (Experience._instance){
      return Experience._instance
    }
    Experience._instance = this

    if (!this.canvas) {
      throw Error("Canvas não reconhecido")
    }

    this.input = new Input()
    this.simpleGraphs = new SimpleGraphs()
    this.multigraphs = new Multigraphs()

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
    this.input.setSubmitMessage()
    
    if(this.input.isMultigraphSequence()){
      if (this.input.isSimpleGraphSequence()){
        this.simpleGraphs.update()
        this.simpleGraphs.draw()
        return 
      } 

      this.multigraphs.update()
      this.multigraphs.draw()
      return

    }

    this.simpleGraphs.eraseGraph() 
    this.multigraphs.eraseGraph() 
  }

}
