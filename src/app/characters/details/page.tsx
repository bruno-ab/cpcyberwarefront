'use client'
import React, { useState } from 'react';
import styles from './details.module.css';

const initialCharacterData = {
  metadata: {
    name: "V",
    role: "Solo",
    background: "Nomad",
    description: "Nascido nos becos sombrios de Night City, Alex, um street kid, aprendeu desde cedo a arte da sobrevivência nas ruas caóticas da metrópole futurista. Seu destino mudou ao cruzar caminho com Razor, um fixer enigmático que o recrutou para realizar trabalhos sujos em troca de informações valiosas. Envolvendo-se em tramas corporativas, roubos e sabotagens, Alex aprimorou suas habilidades enquanto enfrentava dilemas morais, questionando sua própria autonomia. Ao desvendar segredos obscuros e se tornar uma peça-chave em um xadrez mortal, o street kid emergiu como uma figura lendária, navegando habilmente entre as sombras de Cyberpunk 2077.",
    image: "https://i.pinimg.com/564x/96/31/0c/96310ca833912dc9485b8850f7e22a9e.jpg",
    song: "https://open.spotify.com/embed/track/6UzbCEoThoNe8Upe4sn3Us?utm_source=generator",
    quotes: [
      "I'm gonna be a legend in this city.",
      "If you wanna be a legend, you gotta make a name for yourself.",
      "Follow the plan, V. Always.",
      "Arasaka, they're coming for me. You gotta hurry.",
      "If a Maelstrom crew member is watching this, I'm coming for you.",
    ]
  }
};

const CharacterDetails = () => {
  const [characterData, setCharacterData] = useState(initialCharacterData);
  const [currentQuote, setCurrentQuote] = useState(0);

  const handleInputChange = (key, event) => {
    setCharacterData(prevData => ({
      ...prevData,
      metadata: {
        ...prevData.metadata,
        [key]: event.target.value
      }
    }));
  };

  const handleTextAreaChange = (event) => {
    setCharacterData(prevData => ({
      ...prevData,
      metadata: {
        ...prevData.metadata,
        description: event.target.value
      }
    }));
  };

  const handleNextQuote = () => {
    setCurrentQuote((prevQuote) => (prevQuote + 1) % characterData.metadata.quotes.length);
  };

  return (
    <div className={styles.container}>
      <div className={styles.quoteOverlay}>
        <h2 id="quote">{characterData.metadata.quotes[currentQuote]}</h2>
      </div>

      <img
          src={characterData.metadata.image}
          alt="Character"
          className={styles.characterImage}
      />
      <div className={styles.inputField}>
        <label className={styles.inputLabel} htmlFor="name">Name:</label>
        <input
          id="name"
          value={characterData.metadata.name}
          onChange={(e) => handleInputChange('name', e)}
          className={styles.inputText}
        />
      </div>
      <div className={styles.inputField}>
        <label className={styles.inputLabel} htmlFor="role">Role:</label>
        <input
          id="role"
          value={characterData.metadata.role}
          onChange={(e) => handleInputChange('role', e)}
          className={styles.inputText}
        />
      </div>
      <div className={styles.inputField}>
        <label className={styles.inputLabel} htmlFor="background">Background:</label>
        <input
          id="background"
          value={characterData.metadata.background}
          onChange={(e) => handleInputChange('background', e)}
          className={styles.inputText}
        />
      </div>
      <div className={styles.inputField}>
        <label className={styles.inputLabel} htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={characterData.metadata.description}
          onChange={handleTextAreaChange}
          rows={5}
          className={styles.textArea}
        />
      </div>
      <iframe
        className={styles.iframe}
        src={characterData.metadata.song}
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
      <div className={styles.quoteContainer}>
        <div className={styles.carousel}>
          {characterData.metadata.quotes.map((quote, index) => (
            <div key={index} className={styles.quoteCard} style={{ display: index === currentQuote ? 'block' : 'none' }}>
              <p className={styles.quote}>{quote}</p>
            </div>
          ))}
        </div>
        <button className={styles.button} onClick={handleNextQuote}>Next Quote</button>
      </div>
    </div>
  );
}

export default CharacterDetails;