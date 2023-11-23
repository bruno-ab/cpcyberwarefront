import React from 'react';

const characterData = {
    metadata: {
        name: "V",
        role: "Solo",
        background: "Nomad",
        faction: "Aldecaldo",
        description: "An iconic character that wants to be a legend in Night City.",
        image: "/characters/placeholder.png",
        song: "https://open.spotify.com/embed/track/6UzbCEoThoNe8Upe4sn3Us?utm_source=generator",
        quotes:[
            "I'm gonna be a legend in this city.",
            "If you wanna be a legend, you gotta make a name for yourself.",
            "Follow the plan, V. Always.",
            "Arasaka, they're coming for me. You gotta hurry.",
            "If a Maelstrom crew member is watching this, I'm coming for you.",
        ]
    }
}

export function CharacterDetails() {

  return (
    <div>
        <iframe
          style={{ borderRadius: '12px' }}
          src={characterData.metadata.song}
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
    </div>
  );
}

export default CharacterDetails;
