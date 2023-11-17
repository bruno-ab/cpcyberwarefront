const defaultAttributes = {
  "physical": {
    "strength": 3,
    "dexterity": 2,
    "stamina": 1,
  },
  "social": {
    "charisma": 2,
    "manipulation": 2,
    "appearance": 2,
  },
  "mental": {
    "perception": 2,
    "intelligence": 2,
    "wits": 2,
  },
};

const defaultAbilities = {
  "talents": {
    "alertness": 0,
    "athletics": 0,
    "brawl": 0,
    "empathy": 0,
    "expression": 0,
    "intimidation": 0,
    "leadership": 0,
    "streetwise": 0,
    "subterfuge": 0
  },
  "skills": {
    "animal_ken": 0,
    "crafts": 0,
    "drive": 0,
    "etiquette": 0,
    "firearms": 0,
    "melee": 0,
    "performance": 0,
    "security": 0,
    "stealth": 0,
    "survival": 0
  },
  "knowledges": {
    "academics": 0,
    "computer": 0,
    "finance": 0,
    "investigation": 0,
    "law": 0,
    "medicine": 0,
    "occult": 0,
    "politics": 0,
    "science": 0,
    "technology": 0
  }
}

const defaultResources = {
    "backgrounds":{
      "contacts": 0,
    },
    "virtues":{
        "conscience": 0,
        "self_control": 0,
        "courage": 0
    },
    "other_traits":{
        "humanity": 0,
        "path": 0,
        "ram": 0,
        "willpower": 0,
    },
    "merits":{},
    "flaws": {},
}

export  {defaultAttributes, defaultAbilities, defaultResources};
