'use client';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './createCharacterForm.module.css';
import { useRouter } from 'next/navigation';
import { apiUrl, authHeaders } from '../../lib/api';
import { fetchMineCampaigns, type CampaignRow } from '../../lib/campaignsApi';
import { getAccessToken } from '../../lib/authSession';

export function CreateCharacterForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const loadCampaigns = useCallback(async () => {
    if (!getAccessToken()) {
      setCampaigns([]);
      return;
    }
    const mine = await fetchMineCampaigns();
    setCampaigns(mine?.participating ?? []);
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!campaignId) {
      setMessage('Escolha a campanha deste personagem.');
      return;
    }

    if (campaigns.length === 0) {
      setMessage(
        'Você não participa de nenhuma campanha. Peça um convite ao narrador.',
      );
      return;
    }

    const data: Record<string, unknown> = {
      name: name,
      role: role,
      metadata: '',
      cyberwares: [],
      campaignId: Number(campaignId),
    };

    try {
      const response = await fetch(apiUrl('/api/characters'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const created = await response.json().catch(() => null);
        const id = created?.id;
        if (id) {
          router.push(`/sheet?id=${encodeURIComponent(String(id))}`);
        } else {
          router.push(`/campaigns/${campaignId}`);
        }
      } else {
        const err = await response.json().catch(() => null);
        const detail =
          err?.message?.message ||
          err?.message ||
          'Verifique suas credenciais e tente de novo.';
        setMessage(typeof detail === 'string' ? detail : 'Acesso negado.');
      }
    } catch (error) {
      console.log(error);
      setMessage('Erro no servidor. Damn Arasaka!');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form
        className={`${styles.cyberpunk} ${styles.loginForm}`}
        onSubmit={handleFormSubmit}
      >
        <div>Nome</div>
        <div className="cyberpunk">
          <input
            id="name"
            type="text"
            className="nav-message"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>Papel (Role)</div>
        <div className="cyberpunk">
          <input
            id="role"
            type="text"
            className="nav-message"
            placeholder=" "
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        {campaigns.length > 0 ? (
          <>
            <div>Campanha</div>
            <div className="cyberpunk">
              <select
                id="campaignId"
                className="nav-message"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                required
              >
                <option value="">Selecione…</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} (ID {c.id})
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.hint}>
              Um personagem só pode pertencer a uma campanha. Aceite convites em
              Campanhas antes de criar a ficha.
            </p>
          </>
        ) : (
          <p className={styles.hint}>
            Sem campanhas na conta. Crie uma como narrador ou aceite um convite
            antes de registrar personagem.
          </p>
        )}
        {message ? <p className={styles.hint}>{message}</p> : null}
        <button type="submit" className="button button--primary button--size-xl">
          Criar personagem
        </button>
      </form>
    </div>
  );
}

export default CreateCharacterForm;
