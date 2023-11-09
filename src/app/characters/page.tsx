'use client'
import React, { useState } from 'react';
import Header from '../header/Header';
const imgPath = '/characters/placeholder.png';
const data = [
  {
    "id": 1,
    "name": "Jack Wells",
    "role": "Solo",
    "imageUrl": '/characters/01.png',
    "cyberwares": [
      {
        "id": 1,
        "name": "Spring Joints",
        "description": "The Spring Joints are Cyberware for the Skeleton in Cyberpunk 2077.",
      }
    ]
  },
  {
    "id": 2,
    "name": "Judy Alvarez",
    "role": "Netrunner",
    "imageUrl": '/characters/02.png',
    "cyberwares": [
      {
        "id": 2,
        "name": "Optical Camouflage",
        "description": "Optical Camouflage renders the user invisible by bending light around them."
      }
    ]
  },
  {
    "id": 3,
    "name": "Bob Anderson",
    "role": "Solo",
    "imageUrl": imgPath,
    "cyberwares": [
      {
        "id": 3,
        "name": "Neural Interface",
        "description": "The Neural Interface allows direct communication between the user's brain and computer systems."
      },
      {
        "id": 4,
        "name": "Enhanced Reflexes",
        "description": "Enhanced Reflexes cyberware increases the user's reaction time significantly."
      }
    ]
  }
];

export function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState(data[0]);

  const handleCharacterChange = (event) => {
    const selectedId = parseInt(event.target.value);
    const selectedCharacterData = data.find((character) => character.id === selectedId);
    setSelectedCharacter(selectedCharacterData);
  };

  return (
    <section className="cyberpunk black">
      <Header />
      <h2 className="cyberpunk">Characters</h2>
      <select className="cyberpunk" onChange={handleCharacterChange} value={selectedCharacter.id}>
        {data.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name}
          </option>
        ))}
      </select>
      <br />
      {selectedCharacter && (
        <div>
          <h3>{selectedCharacter.name}</h3>
          <img src={selectedCharacter.imageUrl} alt={selectedCharacter.name} style={{ maxWidth: '100%' }} />
        </div>
      )}
      {selectedCharacter && (
         <div class="resolved children1 width2">
          <h2>{selectedCharacter.role}</h2>
         <p>{selectedCharacter.cyberwares[0].description}</p>
        </div>
      )}
    </section>
  );
}

export default Characters;
