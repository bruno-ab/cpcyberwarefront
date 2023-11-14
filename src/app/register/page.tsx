'use client';
import React, { useState } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation'


export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter()

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name: name,
      email: email,
      phone: phone,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:4444/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/login")
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
      <div className={styles.glitchFrame}>
        <div className={styles.glitchH1}>
          <img src='/cp2077logo.png' alt='logo' className={styles.logo} />
        </div>
        <img src="https://images.unsplash.com/photo-1570100031390-fcc3a048eacb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80" className={styles.glitchOverlay}></img>
        <img src="https://images.unsplash.com/photo-1570100031390-fcc3a048eacb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80" className={styles.glitchBase}></img>
      </div>
      <form className={`${styles.cyberpunk} ${styles.loginForm}`} onSubmit={handleFormSubmit}>
        <div> Email</div>
        <div className="cyberpunk">
          <input
            id="email"
            type="text"
            className="nav-message"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
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
        <div> Phone</div>
        <div className="cyberpunk">
          <input
            id="name"
            type="text"
            className="nav-message"
            placeholder=" "
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div> Password</div>
        <div className="cyberpunk">
          <input
            id="password"
            type="password"
            className="nav-message"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="button button--primary button--size-xl">
          Login
        </button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default Register;
