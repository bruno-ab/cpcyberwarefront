'use client';
import React, { useState } from 'react';
import styles from './abilities.module.css';

const data = {
  "Abilities": {
    "Talents": [
      { "name": "Alertness", "value": 2 },
      { "name": "Athletics", "value": 1 },
      { "name": "Brawl", "value": 3 },
      { "name": "Sports", "value": 1 }
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

const saveDataToApi = (talentValues, skillValues, knowledgeValues) => {
  // Substitua a URL da API e o método de envio conforme necessário
  const apiUrl = 'sua_url_da_api';
  const requestBody = {
    talentValues,
    skillValues,
    knowledgeValues,
  };

  console.log(requestBody)
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao enviar dados para a API');
      }
      console.log('Dados enviados com sucesso para a API');
    })
    .catch((error) => {
      console.error('Erro:', error.message);
    });
};

const Abilities = () => {
  const [talentValues, setTalentValues] = useState(
    data.Abilities.Talents.reduce((acc, attribute) => {
      acc[attribute.name] = attribute.value;
      return acc;
    }, {})
  );

  const [skillValues, setSkillValues] = useState(
    data.Abilities.Skills.reduce((acc, attribute) => {
      acc[attribute.name] = attribute.value;
      return acc;
    }, {})
  );

  const [knowledgeValues, setKnowledgeValues] = useState(
    data.Abilities.Knowledges.reduce((acc, attribute) => {
      acc[attribute.name] = attribute.value;
      return acc;
    }, {})
  );

  const handleBolinhaClick = (category, attributeName, currentIndex) => {
    if (currentIndex < category[attributeName] - 0) {
      // Remove a bolinha da direita
      category[attributeName] -= 1;
    } else {
      // Adiciona uma bolinha à esquerda
      category[attributeName] += 1;
    }

    // Atualiza o estado correspondente
       switch (category) {
      case talentValues:
        setTalentValues({ ...talentValues, [attributeName]: category[attributeName] });
        saveDataToApi(talentValues, skillValues, knowledgeValues);
        break;
      case skillValues:
        setSkillValues({ ...skillValues, [attributeName]: category[attributeName] });
        saveDataToApi(talentValues, skillValues, knowledgeValues);
        break;
      case knowledgeValues:
        setKnowledgeValues({ ...knowledgeValues, [attributeName]: category[attributeName] });
        saveDataToApi(talentValues, skillValues, knowledgeValues);
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
        userSelect: 'none', // Impede a seleção de texto
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
              {data.Abilities.Talents.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(talentValues, attribute.name)} {attribute.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Skills</p>
              {data.Abilities.Skills.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(skillValues, attribute.name)} {attribute.name}
                </p>
              ))}
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Knowledges</p>
              {data.Abilities.Knowledges.map((attribute) => (
                <p key={attribute.name}>
                  {renderBolinhhas(knowledgeValues, attribute.name)} {attribute.name}
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