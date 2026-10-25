'use client';

import React, { useState } from 'react';
import styles from './abilities.module.css';
import { defaultAbilities } from './defaultSheet';
import { apiUrl, authHeaders } from '../../lib/api';
import { StatDots } from '../../components/sheet/StatDots';

const saveDataToApi = (id, data, talentValues, skillValues, knowledgeValues) => {
  data.talents = talentValues;
  data.skills = skillValues;
  data.knowledges = knowledgeValues;

  fetch(apiUrl(`/api/characters/${id}/sheet`), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao enviar dados para a API');
      }
    })
    .catch((error) => {
      console.error('Erro:', error.message);
    });
};

const Abilities = ({ characterData }) => {
  const data = characterData.sheet || defaultAbilities;
  const bonuses = characterData.statBonuses || {};
  const [talentValues, setTalentValues] = useState(
    Object.entries(data.talents || {}).reduce((acc, [name, value]) => {
      acc[name] = Number(value) || 0;
      return acc;
    }, {}),
  );

  const [skillValues, setSkillValues] = useState(
    Object.entries(data.skills || {}).reduce((acc, [name, value]) => {
      acc[name] = Number(value) || 0;
      return acc;
    }, {}),
  );

  const [knowledgeValues, setKnowledgeValues] = useState(
    Object.entries(data.knowledges || {}).reduce((acc, [name, value]) => {
      acc[name] = Number(value) || 0;
      return acc;
    }, {}),
  );

  const handleBolinhaClick = (category, attributeName, currentIndex) => {
    const current = Number(category[attributeName]) || 0;
    let next = current;
    if (currentIndex < current) next -= 1;
    else next += 1;
    next = Math.max(0, Math.min(5, next));
    category[attributeName] = next;

    if (category === talentValues) {
      const updated = { ...talentValues, [attributeName]: next };
      setTalentValues(updated);
      saveDataToApi(
        characterData.id,
        data,
        updated,
        skillValues,
        knowledgeValues,
      );
      return;
    }
    if (category === skillValues) {
      const updated = { ...skillValues, [attributeName]: next };
      setSkillValues(updated);
      saveDataToApi(
        characterData.id,
        data,
        talentValues,
        updated,
        knowledgeValues,
      );
      return;
    }
    const updated = { ...knowledgeValues, [attributeName]: next };
    setKnowledgeValues(updated);
    saveDataToApi(characterData.id, data, talentValues, skillValues, updated);
  };

  const renderRow = (category, name) => (
    <p key={name}>
      <StatDots
        base={Number(category[name]) || 0}
        bonus={Number(bonuses[name]) || 0}
        max={5}
        onBaseClick={(index) => handleBolinhaClick(category, name, index)}
        label={`${name}: base ${category[name] || 0}${
          bonuses[name] ? ` + chrome ${bonuses[name]}` : ''
        }`}
      />{' '}
      {name}
    </p>
  );

  return (
    <center>
      <table className={styles.abilitiestable}>
        <tbody>
          <tr>
            <td valign="top" width="30%">
              <p
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#ff1111',
                }}
              >
                Talents
              </p>
              {Object.keys(data.talents || defaultAbilities.talents).map(
                (name) => renderRow(talentValues, name),
              )}
            </td>
            <td valign="top" width="30%">
              <p
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#ff1111',
                }}
              >
                Skills
              </p>
              {Object.keys(data.skills || defaultAbilities.skills).map((name) =>
                renderRow(skillValues, name),
              )}
            </td>
            <td valign="top" width="30%">
              <p
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#ff1111',
                }}
              >
                Knowledges
              </p>
              {Object.keys(data.knowledges || defaultAbilities.knowledges).map(
                (name) => renderRow(knowledgeValues, name),
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <p
        style={{
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: '#02d7f2',
          fontFamily: 'monospace',
        }}
      >
        Ciano = ficha · Vermelho = chrome instalado
      </p>
    </center>
  );
};

export default Abilities;
