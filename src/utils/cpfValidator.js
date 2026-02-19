// Validador de CPF
export const validarCPF = (cpf) => {
  if (!cpf) return false;
  // Remove caracteres especiais e espaços
  cpf = String(cpf).replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Se variável de ambiente CPF_STRICT=true, executa validação completa
  if (process.env.CPF_STRICT === 'true') {
    // Calcula o primeiro dígito verificador
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
      return false;
    }

    // Calcula o segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpf.substring(10, 11))) {
      return false;
    }
  }

  // Em modo não estrito, basta ter 11 dígitos e não ser sequência repetida
  return true;
};

// Formata CPF para exibição (XXX.XXX.XXX-XX)
export const formatarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return cpf;
  return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`;
};

// Normaliza CPF removendo caracteres especiais
export const normalizarCPF = (cpf) => {
  return cpf.replace(/[^\d]/g, '');
};
