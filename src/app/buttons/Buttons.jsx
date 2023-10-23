const audio = "../../../public/cp_sfx_01.mp3";

function handleButtonClick() {
  // todo, descobrir como tocar o som
 audio.play()
}

export function Button({ text,path,onClick=handleButtonClick }){
    return (
      // <a  href={path} class="cybr-btn" onClick={onClick}><
      <a  href={path} class="cybr-btn">
          {text}<span aria-hidden>_</span>
          <span aria-hidden class="cybr-btn__glitch">{text}</span>
          {/* <span aria-hidden class="cybr-btn__tag">V.1.03</span> */}
      </a>
    )
}

export default Button