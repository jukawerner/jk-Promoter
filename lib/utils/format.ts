export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";
  
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");
  
  // Verifica se é celular (9 dígitos) ou telefone fixo (8 dígitos)
  if (numbers.length === 11) {
    // Formato: (XX) 9XXXX-XXXX
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 10) {
    // Formato: (XX) XXXX-XXXX
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  // Se não se encaixar em nenhum formato, retorna como está
  return phone;
}
