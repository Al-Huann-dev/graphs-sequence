import Experience from './Experience'
import './styleguide.css'

function initScripts(){
  const experience = Experience.getExperience()
  console.log(experience)
}



document.addEventListener("DOMContentLoaded", () => initScripts())
