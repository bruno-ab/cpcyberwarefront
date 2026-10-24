'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { BodyScanner, ScannerSlot } from '../../components/scanner/BodyScanner';
import { apiUrl } from '../../lib/api';

const ScannerPage = () => {
  const [slots, setSlots] = useState<ScannerSlot[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/cyberware/slots'))
      .then((r) => r.json())
      .then((d) => {
        const list = (d.slots || d || []).map((s: any) => ({
          ...s,
          installed: s.id === 'operating_system' ? [{ name: 'Sandevistan', rarity: 'Legendary' }] : [],
        }));
        setSlots(list);
      })
      .catch(() => setSlots([]));
  }, []);

  const onPsychosis = useCallback(({ humanity }: { humanity: number }) => {
    setToast(`Alerta biomonitor: humanidade ${humanity}. Notificar GM (psychosis:threshold).`);
  }, []);

  return (
    <PageFrame>
      <HudPanel title="BodyScanner">
        {toast && <p style={{ color: 'var(--cp-alert)' }}>{toast}</p>}
        <BodyScanner
          slots={slots}
          capacityUsed={11}
          capacityMax={10}
          humanity={-1}
          onPsychosis={onPsychosis}
        />
      </HudPanel>
    </PageFrame>
  );
};

export default ScannerPage;
