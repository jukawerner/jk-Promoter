export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `O campo ${fieldName} é obrigatório`;
  }
  return null;
};

export const validateSelect = (value: any, fieldName: string): string | null => {
  if (!value || value === '') {
    return `Por favor, selecione uma opção para ${fieldName}`;
  }
  return null;
};
