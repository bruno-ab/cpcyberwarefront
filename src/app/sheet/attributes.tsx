'use client';

import React, { useState } from 'react';
import styles from './abilities.module.css';
import { defaultAttributes } from './defaultSheet';
import { apiUrl, authHeaders } from '../../lib/api';
import { StatDots } from '../../components/sheet/StatDots';

const saveDataToApi = (
  id,
  data,
  physicalValues,
  socialValues,
  mentalValues,
) => {
  data.physical = physicalValues;
  data.social = socialValues;
  data.mental = mentalValues;

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

const Attributes = ({ characterData }) => {
  const data = characterData.sheet || defaultAttributes;
  const bonuses = characterData.statBonuses || {};
  const [physicalValues, setPhysicalValues] = useState(
    Object.entries(data.physical || defaultAttributes.physical).reduce(
      (acc, [name, value]) => {
        acc[name] = Number(value) || 0;
        return acc;
      },
      {},
    ),
  );

  const [socialValues, setSocialValues] = useState(
    Object.entries(data.social || defaultAttributes.social).reduce(
      (acc, [name, value]) => {
        acc[name] = Number(value) || 0;
        return acc;
      },
      {},
    ),
  );

  const [mentalValues, setMentalValues] = useState(
    Object.entries(data.mental || defaultAttributes.mental).reduce(
      (acc, [name, value]) => {
        acc[name] = Number(value) || 0;
        return acc;
      },
      {},
    ),
  );

  const handleBolinhaClick = (category, attributeName, currentIndex) => {
    const current = Number(category[attributeName]) || 0;
    let next = current;
    if (currentIndex < current) next -= 1;
    else next += 1;
    next = Math.max(0, Math.min(5, next));
    category[attributeName] = next;

    if (category === physicalValues) {
      const updated = { ...physicalValues, [attributeName]: next };
      setPhysicalValues(updated);
      saveDataToApi(
        characterData.id,
        data,
        updated,
        socialValues,
        mentalValues,
      );
      return;
    }
    if (category === socialValues) {
      const updated = { ...socialValues, [attributeName]: next };
      setSocialValues(updated);
      saveDataToApi(
        characterData.id,
        data,
        physicalValues,
        updated,
        mentalValues,
      );
      return;
    }
    const updated = { ...mentalValues, [attributeName]: next };
    setMentalValues(updated);
    saveDataToApi(
      characterData.id,
      data,
      physicalValues,
      socialValues,
      updated,
    );
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
                Physical
              </p>
              {Object.keys(data.physical || defaultAttributes.physical).map(
                (name) => renderRow(physicalValues, name),
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
                Social
              </p>
              {Object.keys(data.social || defaultAttributes.social).map((name) =>
                renderRow(socialValues, name),
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
                Mental
              </p>
              {Object.keys(data.mental || defaultAttributes.mental).map((name) =>
                renderRow(mentalValues, name),
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

export default Attributes;
