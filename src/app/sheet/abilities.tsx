'use client';
import React, { useState } from 'react';
import styles from './abilities.module.css';
import { defaultAbilities } from './defaultSheet';

const saveDataToApi = (data,talentValues, skillValues, knowledgeValues) => {
  const apiUrl = `http://localhost:4444/characters/${data.id}/sheet`;
  data.talents = talentValues;
  data.skills = skillValues;
  data.knowledges = knowledgeValues;

  console.log('dados para serem enviados',data)
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
      console.log('Dados enviados com sucesso para a API');
    })
    .catch((error) => {
      console.error('Erro:', error.message);
    });
};


const Abilities = ({ characterData }) => {
  console.log('characterData:', characterData);
  const data = characterData.sheet || defaultAbilities;
  const [talentValues, setTalentValues] = useState(
    Object.entries(data.talents || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [skillValues, setSkillValues] = useState(
    Object.entries(data.skills || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [knowledgeValues, setKnowledgeValues] = useState(
    Object.entries(data.knowledges || {}).reduce((acc, [name, value]) => {
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
      case talentValues:
        setTalentValues({ ...talentValues, [attributeName]: category[attributeName] });
        saveDataToApi(data, talentValues, skillValues, knowledgeValues);
        break;
      case skillValues:
        setSkillValues({ ...skillValues, [attributeName]: category[attributeName] });
        saveDataToApi(data, talentValues, skillValues, knowledgeValues);
        break;
      case knowledgeValues:
        setKnowledgeValues({ ...knowledgeValues, [attributeName]: category[attributeName] });
        saveDataToApi(data, talentValues, skillValues, knowledgeValues);
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
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Talents</p>
              {Object.entries(data.talents || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(talentValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Skills</p>
              {Object.entries(data.skills || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(skillValues, name)} {name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Knowledges</p>
              {Object.entries(data.knowledges || {}).map(([name, value]) => (
                <p key={name}>
                  {renderBolinhhas(knowledgeValues, name)} {name}
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
