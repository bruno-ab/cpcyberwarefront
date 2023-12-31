'use client';
import React, { useState } from 'react';
import styles from './createCharacterForm.module.css';
import { useRouter } from 'next/navigation'


export function CreateCharacterForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [diceResult, setDiceResult] = useState(1);
  const router = useRouter()

  const rollDice = () => {
    // Generate a random number between 1 and 20
    const result = Math.floor(Math.random() * 20) + 1;
    setDiceResult(result);

    // Add a delay before resetting the dice result to allow for animation
    setTimeout(() => {
      setDiceResult(1);
    }, 3000); // Adjust the duration of the animation as needed
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: name,
      role: role,
      metadata: "",
      cyberwares:[]
    };

    try {
      const response = await fetch('https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // const data = await response.json(); 
        // console.log(data)
        // const name = data.name; 
        // setMessage(`Access granted! ${name} created!`);
         router.push("/characters")
      } else {
        setMessage('Access denied! Verify your credentials and try again.');
      }
    } catch (error) {
      console.log(error)
      setMessage('Access denied due to server error! Damn Arasaka!');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={`${styles.cyberpunk} ${styles.loginForm}`} onSubmit={handleFormSubmit}>
        <div> Name</div>
        <div className="cyberpunk">
          <input
            id="name"
            type="text"
            className="nav-message"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div> Role</div>
        <div className="cyberpunk">
          <input
            id="role"
            type="text"
            className="nav-message"
            placeholder=" "
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <button type="submit" className="button button--primary button--size-xl">
          Create New Character
        </button>
      </form>
    </div>
  );
}

export default CreateCharacterForm