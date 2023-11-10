import React from 'react';
import styles from './resources.module.css';
const data = {
  "Backgrounds": [
    { "name": "Allies", "value": 1 },
    { "name": "Resources", "value": 2 },
    { "name": "Retainers", "value": 1 }
  ],
  "Virtues": {
    "Conscience": 3,
    "SelfControl": 4,
    "Courage": 2
  },
  "Humanity": 7,
  "Willpower": 5,
  "RAM": 4,
  "Role Abilities": [
    { "name": "Solo", "value": 2 },
    { "name": "Netrunner", "value": 1 },
  ],
  "Merits": [
    { "name": "Eidetic Memory", "value": true },
    { "name": "Iron Will", "value": true }
  ],
  "Flaws": [
    { "name": "Nightmares", "severity": "Moderate" },
    { "name": "Compulsion (Counting)", "severity": "Minor" }
  ]
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

const CyberPunkResource = () => {
  return (
    <center>
       <table className={styles.resourcestable}>
        <tbody>
          <tr>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Backgrounds</p>
              {data.Backgrounds.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(attribute.value)} {attribute.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Virtues</p>
              {Object.keys(data.Virtues).map((virtue) => (
                <p key={virtue}>
                  {renderBolinhhas(data.Virtues[virtue])} {virtue}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Other Information</p>
              <p>
                RAM: {renderBolinhhas(data.RAM)}
              </p>
              <p>
                Humanity: {renderBolinhhas(data.Humanity)}
              </p>
              <p>
                Willpower: {renderBolinhhas(data.Willpower)}
              </p>
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Role Abilities</p>
              {data["Role Abilities"].map((roleAbility) => (
                <p key={roleAbility.name}>
                  {renderBolinhhas(roleAbility.value)} {roleAbility.name}
                </p>
              ))}
            </td>
          </tr>
          <tr>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Merits</p>
              {data.Merits.map((merit) => (
                <p key={merit.name}>
                  {merit.value && <span role="img" aria-label="Bolinha preenchida">◉</span>} {merit.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>Flaws</p>
              {data.Flaws.map((flaw) => (
                <p key={flaw.name}>
                  {flaw.severity} {flaw.name}
                </p>
              ))}
            </td>
            {/* Adicione mais colunas conforme necessário */}
          </tr>
        </tbody>
      </table>
    </center>
  );
};

export default CyberPunkResource;
