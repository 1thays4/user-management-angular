export const FORM_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  CEP_LENGTH: 8,
  MESSAGES: {
    REQUIRED_FIELDS: 'Por favor, preencha todos os campos obrigatórios.',
    CEP_NOT_FOUND: 'O CEP informado não foi encontrado. Verifique e tente novamente.',
    CEP_FOUND: 'Endereço preenchido automaticamente.',
    CEP_ERROR: 'Não foi possível consultar o CEP. Tente novamente.',
    USER_SAVED: 'Os dados foram salvos com sucesso!',
    FILL_FIRST_TAB: 'Por favor, preencha todos os campos da primeira aba.'
  }
} as const;
