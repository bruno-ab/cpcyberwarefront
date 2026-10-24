import fs from 'fs';

const map = {
  operatingSystem: 'operating_system',
  frontalCortex: 'frontal_cortex',
  face: 'face',
  skeleton: 'skeleton',
  nervousSystem: 'nervous_system',
  circulatorySystem: 'circulatory_system',
  integumentarySystem: 'integumentary_system',
  hands: 'hands',
  arms: 'arms',
  legs: 'legs',
};

const patch = (path) => {
  let s = fs.readFileSync(path, 'utf8');
  let lastType = 'default';
  const lines = s.split('\n');
  const out = lines.map((line) => {
    const tm = line.match(/type: CyberWareSlot\.(\w+)/);
    if (tm) lastType = map[tm[1]] || 'default';
    if (line.includes("image: '',") || line.includes('image: "",')) {
      return line.replace(/image: ['"]{2},/, `image: '/images/cyberware/${lastType}.svg',`);
    }
    return line;
  });
  fs.writeFileSync(path, out.join('\n'));
  console.log('patched', path);
};

patch('src/data/cyberwareCatalog.ts');
