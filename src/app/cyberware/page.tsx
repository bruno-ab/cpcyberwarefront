'use client';
import React from 'react';
import { useRouter } from 'next/navigation'

import Header from '../header/Header';

export function CyberWare() {
  return (
    <section className="cyberpunk">
      <Header />
      <h2 className="cyberpunk">Cyberwares</h2>
      <p className="cyberpunk inverse scannedv">
        Em "Cyberpunk 2077," os "cyberwares" são implantes cibernéticos que os personagens do jogo podem adquirir e instalar em seus corpos para aprimorar suas habilidades e características. Esses implantes variam em função e efeitos, oferecendo aos jogadores uma série de opções para personalizar seu personagem. Aqui estão alguns exemplos de tipos comuns de cyberwares em "Cyberpunk 2077":
      </p>
      <div className="human-body">
        {/* ... (Seu código SVG) */}
      </div>
      <select className="cyberpunk">
        <option>Gorilla Arms</option>
        <option>Mantis Blade</option>
        <option>Rocket Launch Arm</option>
      </select>
      <br />
      <select className="cyberpunk">
        <option>Gorilla Arms</option>
        <option>Mantis Blade</option>
        <option>Rocket Launch Arm</option>
      </select>
      <br />
      <select className="cyberpunk">
        <option>Gorilla Arms</option>
        <option>Mantis Blade</option>
        <option>Rocket Launch Arm</option>
      </select>
      <br />
     <a class="nav__link " href="/installation"><span class="button">INSTALLATON</span></a>
      <aside className="cyberpunk">
        <ul>
          <li>
            <a href="">$ 12.300 CREDITS</a>
          </li>
        </ul>
      </aside>
    </section>
  );
}

export default CyberWare;
