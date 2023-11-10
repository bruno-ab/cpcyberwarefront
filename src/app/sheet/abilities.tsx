import React from 'react';
import styles from './abilities.module.css';  
const data = {
  "Abilities": {
    "Talents": [
      { "name": "Alertness", "value": 2 },
      { "name": "Athletics", "value": 1 },
      { "name": "Brawl", "value": 3 }
    ],
    "Skills": [
      { "name": "Animal Ken", "value": 2 },
      { "name": "Crafts", "value": 1 },
      { "name": "Drive", "value": 2 }
    ],
    "Knowledges": [
      { "name": "Academics", "value": 2 },
      { "name": "Computer", "value": 1 },
      { "name": "Occult", "value": 3 }
    ]
  },
};

const renderBolinhhas = (value) => {
  const bolinhas = Array.from({ length: value }, (_, index) => (
    <span key={index} role="img" aria-label="Bolinha preenchida" style={{ color: '#02d7f2', fontSize: '24px' }}>
     ●
    </span>
  ));

  const bolinhasVazias = Array.from({ length: 5 - value }, (_, index) => (
    <span key={index} role="img" aria-label="Bolinha vazia" style={{ fontSize: '24px' }}>
      ○
    </span>
  ));

  return [...bolinhas, ...bolinhasVazias];
};

const Abilities = () => {
  return (
    <center>
       <table className={styles.abilitiestable}>
        <tbody>
          <tr>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Talents</p>
              {data.Abilities.Talents.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(attribute.value)} {attribute.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Skills</p>
              {data.Abilities.Skills.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(attribute.value)} {attribute.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Knowledges</p>
              {data.Abilities.Knowledges.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(attribute.value)} {attribute.name}
                </p>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
};

export default Abilities;
