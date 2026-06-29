import { EventEmitter } from "events"

class Input extends EventEmitter {
  sequenceOfNumbersInput: HTMLInputElement
  form: HTMLFormElement
  degreeList: number[] = []
  message: HTMLSpanElement

  constructor() {
    super()

    this.sequenceOfNumbersInput = document.querySelector("#sequencer")!
    this.form = document.querySelector("form")!
    this.message = document.querySelector(".user-message")!
    console.log(this.message)

    if (!this.sequenceOfNumbersInput) {
      throw Error("Input não reconhecido")
    }

    this.sequenceOfNumbersInput.addEventListener("input", (e) => this.onInputChange(e))
    this.form.addEventListener("submit", (e) => this.onSubmit(e))
  }

  public onSubmit(e: SubmitEvent | Event) {
    e.preventDefault()

    this.emit("update")
  }

  public getSubmitMessage() {
    const isSimple = this.isSimpleGraphSequence();
    const isMulti = this.isMultigraphSequence();
    
    if (isSimple) {
      document.body.dataset.inputStatus = "is-simple-graph";
      this.message.innerHTML = "Sequência válida para grafo simples."
      return
    }

    if (isMulti) {
      document.body.dataset.inputStatus = "is-only-multigraph";
      this.message.innerHTML = "Sequência válida apenas para multigrafos/laços."
      return
    }

    document.body.dataset.inputStatus = "not-graph-sequence";
    this.message.innerHTML = "Sequência completamente inválida (Soma ímpar ou impossível)."
  }

  public onInputChange(e: InputEvent | Event) {
    e.preventDefault()
    console.log("AI")

    let cleanValue = this.sequenceOfNumbersInput.value
      .replace(/[^0-9 ]/g, '')
      .replace(/\s+/g, ' ')

    this.sequenceOfNumbersInput.value = cleanValue

    if (cleanValue === "") {
      console.error("O campo está vazio ou não continha números válidos.");
      return;
    }

    this.degreeList = cleanValue.split(" ").map(numStr => parseInt(numStr, 10))
  }


  public isMultigraphSequence() {
    if (this.degreeList.length === 0) return false

    const totalSum = this.degreeList.reduce((acc, curr) => acc + curr, 0)

    if (totalSum % 2 === 0) {
      return true
    }

    return false
  }

  public isSimpleGraphSequence(): boolean {
    if (this.degreeList.length === 0) return false
    console.log("degreeList not empty")

    const sortedDegrees = this.degreeList.toSorted((a, b) => b - a).filter(x => !isNaN(x))
    console.log(sortedDegrees)

    if (!this.isMultigraphSequence()) return false

    const n = sortedDegrees.length

    for (let k = 1; k <= n; k++) {

      let leftSum = 0
      for (let i = 0; i < k; i++) {
        leftSum += sortedDegrees[i]

      }

      let rightSum = k * (k - 1)
      for (let i = k; i < n; i++) {
        rightSum += Math.min(k, sortedDegrees[i])

      }

      if (leftSum > rightSum) return false

    }

    return true
  }

}

export default Input