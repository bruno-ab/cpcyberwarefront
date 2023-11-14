'use client';
import React, { useState } from 'react';
import styles from './createCharacterForm.module.css';
import { useRouter } from 'next/navigation'


export function CreateCharacterForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter()

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: name,
      role: role,
      metadata: "",
      cyberwares:[]
    };

    try {
      const response = await fetch('http://localhost:4444/characters', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        body: JSON.stringify(data)
      });
    //   console.log(response.json())
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
      <div>{message}</div>
    </div>
  );
}

export default CreateCharacterForm