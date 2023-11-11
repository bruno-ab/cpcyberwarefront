'use client';
import React, { useState } from 'react';
import styles from './login.module.css';
import { redirect, useRouter } from 'next/navigation'


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter()

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch('http://localhost:4444/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const data = await response.json(); 
        const accessToken = data.access_token; 
        localStorage.setItem('access_token', accessToken);
        console.log('access_token:', accessToken);
        setMessage('Access granted!');
        
      
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

export default Login;
