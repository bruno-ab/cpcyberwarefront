// "use client";
// import { useState, useRef } from 'react';
// const sound = '/cp_sfx_01.mp3';

// const musicPlayers = useRef<HTMLAudioElement | undefined>(
//   typeof Audio !== "undefined" ? new Audio(sound) : undefined
// );
// musicPlayers.play()


// export function Button({ text, path }) {
//   const [audio, setAudio] = useState(null);

//   const handleButtonClick = () => {
//     if (musicPlayers) {
//       audio.play();
//     }
//   };

//   const loadAudio = () => {
//     const newAudio = new Audio(sound);
//     setAudio(newAudio);
//   };

//   return (
//     <a href={path} className="cybr-btn" onMouseOver={loadAudio} onClick={handleButtonClick}>
//       {text}<span aria-hidden>_</span>
//       <span aria-hidden className="cybr-btn__glitch">{text}</span>
//     </a>
//   );
// }

// export default Button