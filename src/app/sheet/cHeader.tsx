import React from 'react';
import styles from './cheader.module.css';
import {defaultHeader} from './defaultSheet';
const data = {
  "name": "Jude Alvarez",
  "role": "Netrunner",
  "origin": "Nomad",
  "age": 23,
  "city": "Night City",
  "background": "Street Kid",
  "concept": "Hacker",
  "filiation": "Mox",
};

const CyberPunkCharacterSheet = ({ characterData }) => {
  console.log(characterData)
  const data = characterData.sheet.header || defaultHeader;
  const renderLabelValue = (label, value) => (
    <div style={{ marginBottom: '10px' }}>
      <p>
        <strong>{label}:</strong> {value}
      </p>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', border: '1px solid black', padding: '10px', borderRadius: '10px' }}>
      <h2 className={styles.glitch}>{characterData.name}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {Object.entries(data).map(([label, value]) => (
          renderLabelValue(label.charAt(0).toUpperCase() + label.slice(1), value)
        ))}

      </div>
    </div>
  );
};

export default CyberPunkCharacterSheet;
