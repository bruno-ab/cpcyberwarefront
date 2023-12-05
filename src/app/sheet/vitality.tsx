import React, { useState, useEffect } from 'react';

const VitalityField = ({ characterData }) => {
  const [vitality, setVitality] = useState(0);
  const [vitalityMarked, setVitalityMarked] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setVitality(characterData.sheet.vitality);
    setVitalityMarked(characterData.sheet.vitality_marked);
    updateMessage(characterData.sheet.vitality_marked, characterData.sheet.vitality);
  }, [characterData.sheet.vitality, characterData.sheet.vitality_marked]);

  const handleVitalityChange = (e) => {
    const newVitality = parseInt(e.target.value, 10);
    setVitality(newVitality);
    setVitalityMarked((prevVitalityMarked) =>
      Math.min(prevVitalityMarked, newVitality)
    );
  };

  const handleVitalityBlur = () => {
    saveData();
  };

  const handleVitalityMarkedChange = (e) => {
    const newVitalityMarked = parseInt(e.target.value, 10);
    setVitalityMarked(newVitalityMarked);
    updateMessage(newVitalityMarked, vitality);
  };

  const handleRangeMouseUp = () => {
    saveData();
  };

  const updateMessage = (vitalityMarkedValue, vitalityInput) => {
    console.log(vitalityMarkedValue,vitalityInput)
    if (vitalityMarkedValue === 1) {
      setMessage('Saudável: sem penalidade');
    } else if (vitalityMarkedValue == vitalityInput) {
      setMessage('DEAD');
    } else if (vitalityMarkedValue === 0) {
      setMessage('Saudável: sem penalidade');
    } else if (vitalityMarkedValue === 2) {
      setMessage('Escoriado: -2 dados para a parada de dados');
    } else if (vitalityMarkedValue === 3) {
      setMessage('Escoriado: -2 dados para a parada de dados');
    } else if (vitalityMarkedValue === 4) {
      setMessage('Machucado: -3 na parada de dados');
    } else if (vitalityMarkedValue === 5) {
      setMessage('Gravemente Ferido: -4 na parada de dados');
    } else if (vitalityMarkedValue >= 6) {
      setMessage('Aleijado: -5 na parada de dados');
    } else {
      setMessage('');
    }
  };

  const saveDataToApi = (id, data) => {
    const apiUrl = `https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters/${id}/sheet`;
    console.log(data);
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
          console.log('Erro ao enviar dados para a API');
          throw new Error('Erro ao enviar dados para a API');
        }
      })
      .catch((error) => {
        console.error('Erro:', error.message);
      });
  };

  const saveData = () => {
    const data = characterData.sheet;
    data.vitality = vitality;
    data.vitality_marked = vitalityMarked;

    saveDataToApi(characterData.id, data);
  };

  return (
    <div style={{ textAlign: 'center', color: '#fed33f' }}>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="vitalityInput" style={{ marginRight: '10px', fontSize: '16px' }}>
          Vitality:
        </label>
        <input
          type="number"
          id="vitalityInput"
          value={vitality}
          onChange={handleVitalityChange}
          onBlur={handleVitalityBlur}
          style={{
            padding: '8px',
            fontSize: '14px',
            color: '#2be4ea',
            backgroundColor: '#1e181e',
            border: '1px solid #fed33f',
            borderRadius: '5px',
          }}
        />
      </div>
      <div>
        <label htmlFor="vitalityMarkedInput" style={{ marginRight: '10px', fontSize: '16px' }}>
          Vitality Marked:
        </label>
        <input
          type="range"
          id="vitalityMarkedInput"
          min="0"
          max={vitality}
          value={vitalityMarked}
          onChange={handleVitalityMarkedChange}
          onMouseUp={handleRangeMouseUp}
          style={{
            width: '80%',
            marginTop: '5px',
            marginBottom: '10px',
          }}
        />
        <div style={{ fontSize: '14px', color: '#2be4ea' }}>{vitalityMarked}</div>
        <div style={{ fontSize: '14px', color: '#2be4ea' }}>{message}</div>
      </div>
    </div>
  );
};

export default VitalityField;
