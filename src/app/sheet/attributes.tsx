import React from 'react';

const data = {
  PHYSICAL: [
    { name: 'Strength', value: 3 },
    { name: 'Dexterity', value: 2 },
    { name: 'Stamina', value: 1 },
  ],
  SOCIAL: [
    { name: 'Charisma', value: 2 },
    { name: 'Manipulation', value: 2 },
    { name: 'Appearance', value: 2 },
  ],
  MENTAL: [
    { name: 'Perception', value: 2 },
    { name: 'Intelligence', value: 2 },
    { name: 'Wits', value: 2 },
  ],
};

const Attributes = ({ data: any }) => {
  const renderBolinhhas = (value: any) => {
    const bolinhas = Array.from({ length: value }, (_, index) => (
      <span key={index} role="img" aria-label="Bolinha preenchida" style={{ color: '#02d7f2', fontSize: '24px' }}>
        ●
      </span>
    ));

    const bolinhasVazias = Array.from({ length: 5 - value }, (_, index) => (
      <span key={index} role="img" aria-label="Bolinha vazia"  style={{ color: '#00000', fontSize: '24px' }}>
        ○
      </span>
    ));

    return [...bolinhas, ...bolinhasVazias];
  };

  return (
    <center>
      <table border="1" width="80%">
        <tbody>
          <tr>
            {Object.keys(data).map((category) => (
              <td key={category} valign="top" width="30%">
                <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px' ,color: '#ff1111' }}>{category}</p>
                {data[category].map((attribute: any) => (
                  <p key={attribute.name} >
                    {renderBolinhhas(attribute.value)} {attribute.name}
                  </p>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </center>
  );
};

export default Attributes;
