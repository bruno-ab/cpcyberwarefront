export function Header(){
    return (

    <header className="app-header"><a href="/">Cyberpunk 2077 w0d</a>
        <nav>
        <ul class="nav">
        {/* <li class="nav__link"><Button path={"/characters"} text={"Characters"} /></li> */}
        <a class="nav__link " href="/characters"><span class="nav__link__element">Characters</span></a>
        <a class="nav__link " href="/cyberware"><span class="nav__link__element">CyberWare</span></a>
        <a class="nav__link " href="/rules"><span class="nav__link__element">Rules</span></a>
        <a class="nav__link " href="/account"><span class="nav__link__element">Account</span></a>
        <a class="nav__link " href="/sheet"><span class="nav__link__element">Sheet</span></a>
            {/* <li class="nav__item"><Button path={"/cyberware"}  text={"CyberWare"}/></li>
            <li class="nav__item"><Button path={"/rules"}  text={"Rules" }/></li>
            <li class="nav__item"><Button path={"/account"}  text={"Account"}/> </li>
            <a class="nav__link nav__link--active" href="/account"><span class="nav__link__element">Characters</span><span class="nav__link__element"><span class="badge">0</span></span></a> */}
        </ul>
    </nav>
    </header>   

    )
}

export default Header