export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export const scorePassword = (pwd: string): PasswordStrength => {
  if (!pwd) return 'weak';
  if (pwd.length < 6) return 'weak';
  let points = 0;
  if (pwd.length >= 8) points += 1;
  if (pwd.length >= 12) points += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) points += 1;
  if (/[0-9]/.test(pwd)) points += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) points += 1;
  if (points <= 1) return 'fair';
  if (points <= 3) return 'good';
  return 'strong';
};

export const strengthLabelPt = (s: PasswordStrength): string => {
  if (s === 'weak') return 'Fraca — use pelo menos 6 caracteres';
  if (s === 'fair') return 'Razoável — misture letras e números';
  if (s === 'good') return 'Boa — considere símbolos';
  return 'Forte — pronta para a rede';
};
