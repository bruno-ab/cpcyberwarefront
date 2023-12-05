'use client';
import React, { useState } from 'react';
import styles from './abilities.module.css';
import { defaultAttributes } from './defaultSheet';

const saveDataToApi = (id,data,physicalValues, socialValues, mentalValues) => {
  const apiUrl = `https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters/${id}/sheet`;
  data.physical = physicalValues;
  data.social = socialValues;
  data.mental = mentalValues;


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


const Abilities = ({ characterData }) => {
  const data = characterData.sheet || defaultAttributes;
  const [physicalValues, setPhysicalValues] = useState(
    Object.entries(data.physical || defaultAttributes.physical).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [socialValues, setSocialValues] = useState(
    Object.entries(data.social || defaultAttributes.social).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [mentalValues, setMentalValues] = useState(
    Object.entries(data.mental || defaultAttributes.mental).reduce((acc, [name, value]) => {
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
      case physicalValues:
        setPhysicalValues({ ...physicalValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, physicalValues, socialValues, mentalValues);
        break;
      case socialValues:
        setSocialValues({ ...socialValues, [attributeName]: category[attributeName] });
        saveDataToApi(characterData.id,data, physicalValues, socialValues, mentalValues);
        break;
      case mentalValues:
        setMentalValues({ ...mentalValues, [attributeName]: category[attributeName] });
       saveDataToApi(characterData.id,data, physicalValues, socialValues, mentalValues);
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
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Physical</p>
              {Object.entries(data.physical || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(physicalValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Social</p>
              {Object.entries(data.social || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(socialValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Mental</p>
              {Object.entries(data.mental || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(mentalValues, name)} {name}
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
