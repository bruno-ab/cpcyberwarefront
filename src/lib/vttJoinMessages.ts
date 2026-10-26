export const vttJoinErrorMessage = (code: string | undefined): string => {
  switch (code) {
    case 'unauthorized':
      return 'Sessão expirada. Entre de novo para continuar na mesa.';
    case 'forbidden':
      return 'Você não participa desta campanha. Aceite o convite em Campanhas ou peça acesso ao narrador.';
    case 'scene-not-available':
      return 'A cena ainda não está disponível para jogadores. O narrador precisa ativar e publicar a cena ativa.';
    case 'roster-required':
      return 'Vincule uma ficha à campanha antes de entrar na mesa (crie personagem com campanha ou adicione ao roster).';
    case 'scene-not-found':
      return 'Cena não encontrada. Volte à campanha e abra a mesa de novo.';
    default:
      return 'Não foi possível entrar na mesa. Verifique acesso à campanha e se a cena está publicada.';
  }
};
