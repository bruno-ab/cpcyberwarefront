'use client'
import React from 'react';

const NightCityMap = () => {
  return (
    <div style={{ width: '100%', height: '60vh' }}>
      <iframe
        src="https://maps.piggyback.com/cyberpunk-2077/maps/night-city"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen=""
        aria-hidden="false"
        tabIndex="0"
      ></iframe>
    </div>
  );
}

export default NightCityMap;
