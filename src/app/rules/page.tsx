import Header from '../header/Header';
import styles from './rules.module.css';

function Rules() {
  return (
    <section className={`${styles.cyberpunk} ${styles.black}`}>
      <Header />
      <h2 className={styles.cyberpunk}>Rules</h2>

      <div className={styles.contentContainer}>
        <div className={styles.iframeContainer}>
          <iframe
            className={styles.iframe}
            src="https://open.spotify.com/embed/track/0UHxkkgI5GfV0XBRA1rqfe?utm_source=generator"
            width="30%"
            height="352"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>

        <div className={styles.textContainer}>
          <p className={`${styles.cyberpunk} ${styles.inverse} ${styles.scannedv}`}>
             Cyberpunk 2077 apresenta um mundo futurista e distópico, mergulhado em uma atmosfera sombria e caótica. No centro desse universo, a tecnologia avançada convive com a decadência social, criando uma paisagem urbana repleta de contrastes. Megacorporações controlam os destinos da sociedade, enquanto áreas urbanas decadentes coexistem com zonas de alta tecnologia.

A paisagem é dominada por arranha-céus imponentes e estruturas futuristas, muitas vezes cobertas pela poluição e pela sujeira das ruas. A vida noturna é vibrante, com néons brilhantes iluminando os becos escuros e as vielas, criando uma estética cyberpunk característica. A desigualdade social é evidente, com a elite desfrutando dos frutos do avanço tecnológico, enquanto as camadas mais baixas da sociedade lutam pela sobrevivência em meio à pobreza e à criminalidade.

A tecnologia desempenha um papel fundamental, com implantes cibernéticos, realidade aumentada e inteligência artificial integrando-se à vida cotidiana. No entanto, essa fusão entre humanidade e tecnologia não é isenta de conflitos e dilemas éticos. A busca pelo aprimoramento humano muitas vezes colide com os aspectos mais sombrios da natureza humana.

No cenário de Cyberpunk 2077, as escolhas morais são complexas, e a linha entre certo e errado muitas vezes se dissolve em um universo moralmente ambíguo. As facções rivais, conspirações corporativas e a luta pela liberdade individual contribuem para a trama intrincada e envolvente desse mundo cyberpunk, onde cada ação tem consequências duradouras.
          </p>
        </div>
      </div>

      <iframe
        className={styles.iframe}
        src="https://open.spotify.com/embed/track/6UzbCEoThoNe8Upe4sn3Us?utm_source=generator"
        width="30%"
        height="352"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </section>
  );
}

export default Rules;
