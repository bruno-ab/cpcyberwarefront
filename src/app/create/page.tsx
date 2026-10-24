'use client';

import { useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import Link from 'next/link';

const ROLES = ['Solo', 'Netrunner', 'Techie', 'Fixer', 'Nomad', 'Medtech', 'Rockerboy'];
const ORIGINS = ['Street Kid', 'Corpo', 'Nomad'];

const rollAttr = () => 1 + Math.floor(Math.random() * 4);

const CreateWizardPage = () => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(ROLES[0]);
  const [origin, setOrigin] = useState(ORIGINS[0]);
  const [attrs, setAttrs] = useState({ strength: 2, dexterity: 2, intelligence: 2, charisma: 2 });
  const [story, setStory] = useState('');

  const rollLifepath = () => {
    setOrigin(ORIGINS[Math.floor(Math.random() * ORIGINS.length)]);
    setAttrs({
      strength: rollAttr(),
      dexterity: rollAttr(),
      intelligence: rollAttr(),
      charisma: rollAttr(),
    });
    setStory(
      `Você cresceu como ${origin.toLowerCase()} em Night City. Um gig deu errado; agora o chrome canta no sangue e um fixer ainda cobra a dívida.`,
    );
  };

  return (
    <PageFrame>
      <HudPanel title="Wizard de criação">
        <p>
          Passo {step + 1}/4 — Role → Lifepath → Atributos → Chrome/história
        </p>
        {step === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ROLES.map((r) => (
              <HudButton key={r} variant={role === r ? 'primary' : 'ghost'} onClick={() => setRole(r)}>
                {r}
              </HudButton>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <p>Origem: {origin}</p>
            <HudButton onClick={rollLifepath}>Rolar lifepath</HudButton>
          </>
        )}
        {step === 2 && (
          <ul>
            {Object.entries(attrs).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        )}
        {step === 3 && (
          <>
            <p>Role: {role}</p>
            <p>{story || 'Gere o lifepath no passo anterior.'}</p>
            <p>Chrome inicial: escolha no Ripperdoc após criar a ficha.</p>
            <Link href="/characters">
              <HudButton>Ir para personagens</HudButton>
            </Link>
          </>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <HudButton variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Voltar
          </HudButton>
          <HudButton disabled={step >= 3} onClick={() => setStep((s) => Math.min(3, s + 1))}>
            Próximo
          </HudButton>
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default CreateWizardPage;
