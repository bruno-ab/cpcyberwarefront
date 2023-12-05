'use client';
import React, { useState } from 'react';
import styles from './abilities.module.css';
import styles2 from  './resources.module.css'
import { defaultResources } from './defaultSheet';

const saveDataToApi = (id,data,backgroundsValues, virtuesValues, otherTraitsValues,meritsValues, flawsValues) => {
  const apiUrl = `https://cyberpunk-api-262d98a845d6.herokuapp.com/characters/${id}/sheet`;
  data.backgrounds = backgroundsValues;
  data.virtues = virtuesValues;
  data.other_traits = otherTraitsValues;
  data.merits = meritsValues;
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
  const [maxBolinhas] = useState(10);
  const [newMerits, setNewMerits] = useState('');
  const [newFlaws, setNewFlaws] = useState('');
  const [backgroundsValues, setBackgroundsValues] = useState(
    Object.entries(data.backgrounds || {}).reduce((acc, [name, value]) => {
      acc[name] = value;
      return acc;
    }, {})
  );

  const [newBackground, setNewBackground] = useState({
    name: '',
    value: 0,
  });

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
    const handleAddBackground = () => {
  if (newBackground.name.trim() === '') {

    return;
  }


  const newValue = Math.max(1, Math.min(5, newBackground.value));


  setBackgroundsValues((prevBackgroundsValues) => ({
    ...prevBackgroundsValues,
    [newBackground.name]: newValue,
  }));

  setNewBackground({ name: '', value: 0 });

  saveDataToApi(
    characterData.id,
    data,
    backgroundsValues,
    virtuesValues,
    otherTraitsValues,
    meritsValues,
    flawsValues
  );
};
 
  const handleAddMerits = () => {
    if (newMerits.trim() === '') {
      return;
    }

    setMeritsValues((prevMeritsValues) => ({
      ...prevMeritsValues,
      [newMerits]: '',
    }));

    setNewMerits('');

    saveDataToApi(
      characterData.id,
      data,
      backgroundsValues,
      virtuesValues,
      otherTraitsValues,
      meritsValues,
      flawsValues
    );
  };

  const handleAddFlaws = () => {
    if (newFlaws.trim() === '') {
      return;
    }

    setFlawsValues((prevFlawsValues) => ({
      ...prevFlawsValues,
      [newFlaws]: '',
    }));

    setNewFlaws('');

    saveDataToApi(
      characterData.id,
      data,
      backgroundsValues,
      virtuesValues,
      otherTraitsValues,
      meritsValues,
      flawsValues
    );
  };

    saveDataToApi(
      characterData.id,
      data,
      backgroundsValues,
      virtuesValues,
      otherTraitsValues,
      meritsValues,
      flawsValues
    );
  

  const handleBolinhaClick = (category, attributeName, currentIndex) => {
    if (currentIndex < category[attributeName] - 0) {
      category[attributeName] -= 1;
    } else {
      category[attributeName] += 1;
    }
    category[attributeName] = Math.min(maxBolinhas, category[attributeName]);

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
    
    const bolinhas = Array.from({ length: maxBolinhas }, (_, index) => (
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
              {/* Novo background para adição */}
              <p>
                <input
                  type="text"
                    className={styles2.input2077}
                  placeholder="Novo Background"
                  value={newBackground.name}
                  onChange={(e) => setNewBackground({ ...newBackground, name: e.target.value })}
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={newBackground.value}
                  onChange={(e) => setNewBackground({ ...newBackground, value: parseInt(e.target.value) })}
                />
                <span>{newBackground.value} bolinhas</span>
                <button onClick={handleAddBackground}>Adicionar</button>
              </p>
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
              {Object.entries(data.merits || {}).map(([name]) => (
                <p key={name}>
                  <input
                    type="text"
                       className={styles2.input2077}
                    placeholder={name}
                    value={meritsValues[name]}
                    onChange={(e) =>
                      setMeritsValues({ ...meritsValues, [name]: e.target.value })
                    }
                  />
                </p>
              ))}
              <p>
                <input
                  type="text"
                   className={styles2.input2077}
                  placeholder="Novo Merit"
                  value={newMerits}
                  onChange={(e) => setNewMerits(e.target.value)}
                />
                <button onClick={handleAddMerits}>Adicionar</button>
              </p>
            </td>
            <td valign="top" width="30%">
              <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#ff1111' }}>Flaws</p>
              {Object.entries(data.flaws || {}).map(([name]) => (
                <p key={name}>
                  <input
                    type="text"
                    className={styles2.input2077}
                    placeholder={name}
                    value={flawsValues[name]}
                    onChange={(e) =>
                      setFlawsValues({ ...flawsValues, [name]: e.target.value })
                    }
                  />
                </p>
              ))}
              <p>
                <input
                  type="text"
                    className={styles2.input2077}
                  placeholder="Novo Flaw"
                  value={newFlaws}
                  onChange={(e) => setNewFlaws(e.target.value)}
                />
                <button onClick={handleAddFlaws}>Adicionar</button>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </center>
  );
};
export default Resources;
