'use client';
import React, { useState } from 'react';
import styles from './abilities.module.css';
import { defaultResources } from './defaultSheet';

const saveDataToApi = (id,data,backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues) => {
  const apiUrl = `http://localhost:4444/characters/${id}/sheet`;
  data.backgrounds = backgroundsValues;
  data.virtues = virtuesValues;
  data.other_traits = otherTraitsValues;
  data.merirts = meritsValues;
  data.flaws = flawsValues;

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        console.log('Erro ao enviar dados para a API')
        throw new Error('Erro ao enviar dados para a API');
      }
    })
    .catch((error) => {
      console.error('Erro:', error.message);
    });
};


const Resources = ({ characterData }) => {
  const data = characterData.sheet || defaultResources;
  const [backgroundsValues, setBackgroundsValues] = useState(
    Object.entries(data.backgrounds || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [virtuesValues, setVirtuesValues] = useState(
    Object.entries(data.virtues || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [otherTraitsValues, setOtherTraitsValues] = useState(
    Object.entries(data.other_traits || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );
  const [meritsValues, setMeritsValues] = useState(
    Object.entries(data.merits || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );
  const [flawsValues, setFlawsValues] = useState(
    Object.entries(data.flaws || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const handleBolinhaClick = (category, attributeName, currentIndex) => {
    if (currentIndex < category[attributeName] - 0) {
      category[attributeName] -= 1;
    } else {
      category[attributeName] += 1;
    }
    switch (category) {
      case backgroundsValues:
        setBackgroundsValues({ ...backgroundsValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues);
        break;
      case virtuesValues:
        setVirtuesValues({ ...virtuesValues, [attributeName]: category[attributeName] });
         saveDataToApi(characterData.id,data, backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues);
        break;
      case otherTraitsValues:
        setOtherTraitsValues({ ...otherTraitsValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues);
        break;
      case meritsValues:
        setMeritsValues({ ...meritsValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues);
        break;
      case flawsValues:
        setFlawsValues({ ...flawsValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues);
        break;
      default:
        break;
    }
  };

  const renderBolinhhas = (category, attributeName) => {
    const bolinhas = Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        role="img"
        aria-label={`Bolinha ${index < category[attributeName] ? 'preenchida' : 'vazia'}`}
        style={{
          color: index < category[attributeName] ? '#02d7f2' : '',
          fontSize: '24px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => handleBolinhaClick(category, attributeName, index)}
      >
        ●
      </span>
    ));

    return bolinhas;
  };

  return (
    <center>
      <table className={styles.abilitiestable}>
        <tbody>
          <tr>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Backgrounds</p>
              {Object.entries(data.backgrounds || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(backgroundsValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Virtues</p>
              {Object.entries(data.virtues || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(virtuesValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Resources</p>
              {Object.entries(data.other_traits || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(otherTraitsValues, name)} {name}
                </p>
              ))}
            </td>
             <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Merits</p>
              {Object.entries(data.merits || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(otherTraitsValues, name)} {name}
                </p>
              ))}
            </td>
             <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Flaws</p>
              {Object.entries(data.flaws || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(otherTraitsValues, name)} {name}
                </p>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
};
export default Resources;
