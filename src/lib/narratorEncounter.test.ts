import { describe, expect, it } from 'vitest';
import { buildHeatEncounterText } from './narratorEncounter';

describe('buildHeatEncounterText', () => {
  it('includes encounter blurb and heat line when effects exist', () => {
    const text = buildHeatEncounterText(
      {
        shopMarkup: 1.1,
        contactPenalty: 1,
        encounter: 'hot',
        encounterBlurb: 'Patrulhas agressivas',
        mediaSpotlight: false,
        corpoInterest: true,
        wantedStars: 2,
      },
      { police: 2, corpo: 40, media: 10 },
    );
    expect(text).toContain('Patrulhas agressivas');
    expect(text).toContain('polícia 2/5');
    expect(text).toMatch(/Encontro \[hot/);
  });

  it('falls back when effects are missing', () => {
    const text = buildHeatEncounterText(null, null);
    expect(text).toMatch(/^Encontro:/);
    expect(text).toContain('polícia 0/5');
  });
});
