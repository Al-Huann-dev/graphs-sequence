import {EventEmitter} from "events"

class Input extends EventEmitter {
  sequenceOfNumbersInput: HTMLInputElement
  form: HTMLFormElement
  degreeList: number[] = []

  constructor() {
    super()

    this.sequenceOfNumbersInput = document.querySelector("#sequencer")!
    this.form =  document.querySelector("form")!

    if (!this.sequenceOfNumbersInput) {
      throw Error("Input não reconhecido")
    }

    this.sequenceOfNumbersInput.addEventListener("input", (e) => this.onInputChange(e))
    this.form.addEventListener("submit", (e) => this.onSubmit(e))
  }

  public onSubmit(e: SubmitEvent | Event){
    e.preventDefault()

    this.emit("update")
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

  public isGraphSequence(): boolean {
    if (this.degreeList.length === 0) return false
    console.log("degreeList not empty")

    const sortedDegrees = this.degreeList.toSorted((a, b) => a - b).filter(x => !isNaN(x))
    console.log(sortedDegrees)

    const totalSum = sortedDegrees.reduce((acc, curr) => acc + curr, 0)
    if (totalSum % 2 !== 0) return false

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