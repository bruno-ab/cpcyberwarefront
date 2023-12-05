'use client';
import React, { useState, useEffect } from 'react';
import styles from '../component.module.css';
import { CyberWareTypes, maximumSlots } from '../../cyberwareTypes';
import styles2 from './skeleton.module.css'
import { useRouter } from 'next/navigation';

function Skeleton({ characterData}: any) {
  const router =  useRouter();
  const [cyberwareData, setCyberwareData] = useState(null);
  const [installedCyberwares, setInstalledCyberwares] = useState([]);
  const [selectedCyberwareId, setSelectedCyberwareId] = useState('');
  const characterCyberwares = characterData?.cyberwares || [];
  const skeletonMaximumSlots = maximumSlots.skeleton;

  useEffect(() => {
    const fetchCyberwareData = async () => {
      try {
        const response = await fetch(`https://cyberpunk-api-262d98a845d6.herokuapp.com/api/cyberware`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCyberwareData(data);
        } else {
          console.log('Error fetching cyberware data');
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchCyberwareData();
  }, []);

  

  const handleRemoveCyberware = (id, characterData) => {
    const data = {
      cyberwareId: id,
    };

    try {
      fetch(`https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters/${characterData.id}/cyberware`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log(error)
    }
  };

  const handleInstallCyberware = (id, characterData) => {
    console.log(id)
    console.log(characterData)
    setSelectedCyberwareId(id);
    const data = {
      cyberwareId: id,
    };
    try {
      fetch(`https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters/${characterData.id}/cyberware`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      router.push(`/installation?id=${characterData.id}`);
    } catch (error) {
      console.log(error)
    }
  };

 return (
    <div >
     <table className={styles2.centerTable}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Image</th>
          <th>Description</th>
          <th>Benefits</th>
          <th>Rarity</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(skeletonMaximumSlots)].map((_, index) => {
          const installedCyberwaresInSlot = characterCyberwares.filter((cyberware) => cyberware.slots === index + 1);

          return (
            <React.Fragment key={index}>
              {installedCyberwaresInSlot.length > 0 ? (
                installedCyberwaresInSlot.map((installedCyberware, innerIndex) => (
                  <tr key={`${index}-${innerIndex}`}>
                    <td  className={styles2.centerCell}>{installedCyberware.name}</td>
                    <td className={styles2.centerCell}>
                      <img src={installedCyberware.image} alt={installedCyberware.name} />
                    </td>
                    <td  className={styles2.centerCell}>{installedCyberware.description}</td>
                    <td  className={styles2.centerCell}>{installedCyberware.benefits}</td>
                    <td  className={styles2.centerCell} >{installedCyberware.rarity}</td>
                    <td  className={styles2.centerCell}>
                      <button
                        className={`${styles.btn} ${styles['btn--secondary']}`}
                        onClick={() => handleRemoveCyberware(installedCyberware.id, characterData)}
                      >
                        <span className={styles['btn__content']}>Remove</span>
                        <span className={styles['btn__glitch']}></span>
                        <span className={styles['btn__label']}>r25</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td  className={styles2.centerCell}>
                    <label className={styles2.cp2077SelectLabel} htmlFor={`select-${index}`}>
                      Select Cyberware
                    </label>

                    <select
                      id={`select-${index}`}
                      className={styles2.cp2077Select}
                      onChange={(e) => handleInstallCyberware(e.target.value)}
                    >
                    <option value="">Select...</option>
                      {cyberwareData &&
                        cyberwareData
                          .filter((cyberware) => cyberware.type === 'skeleton')
                          .map((cyberware) => (
                            <option key={cyberware.id} value={cyberware.id}>
                              {cyberware.name}
                            </option>
                          ))}
                    </select>
                  </td>
                  <td ></td>
                  <td></td>
                  <td></td>
                  <td  className={styles2.centerCell}>
                    <button
                      className={`${styles.btn} ${styles['btn--primary']}`}
                      onClick={() => handleInstallCyberware(selectedCyberwareId, characterData)}
                    >
                      <span className={styles['btn__content']}>Install_</span>
                      <span className={styles['btn__glitch']}></span>
                      <span className={styles['btn__label']}>r25</span>
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);
}

export default Skeleton;
