const Header = () => {
  return (
    <header className="app-header">
      <a href="/">Cyberpunk 2077 Storyteller</a>
      <nav>
        <ul className="nav">
          <a className="nav__link" href="/characters">
            <span className="nav__link__element">Characters</span>
          </a>
          <a className="nav__link" href="/cyberware">
            <span className="nav__link__element">CyberWare</span>
          </a>
          <a className="nav__link" href="/catalog">
            <span className="nav__link__element">Catálogo</span>
          </a>
          <a className="nav__link" href="/rules">
            <span className="nav__link__element">Regras</span>
          </a>
          <a className="nav__link" href="/npcs">
            <span className="nav__link__element">NPCs</span>
          </a>
          <a className="nav__link" href="/sheet">
            <span className="nav__link__element">Ficha</span>
          </a>
          <a className="nav__link" href="/account">
            <span className="nav__link__element">Account</span>
          </a>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
