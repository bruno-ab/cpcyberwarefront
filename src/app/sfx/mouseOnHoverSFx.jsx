
export function Button({ path }){
    return (
      <a  href={path} class="cybr-btn">
          Characters<span aria-hidden>_</span>
          <span aria-hidden class="cybr-btn__glitch">Characters</span>
          {/* <span aria-hidden class="cybr-btn__tag">V.1.03</span> */}
      </a>
    )
}

export default Button