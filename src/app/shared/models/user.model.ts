export interface User {
  firstName: string;
  lastName: string;
  gender: string;
  address: Address;
}

export interface Address {
  cep: string;
  state: string;
  street: string;
  neighborhood: string;
  number: string;
  complement?: string;
}

export interface UserFormData {
  primeiroNome: string;
  ultimoNome: string;
  genero: string;
}

export interface AddressFormData {
  cep: string;
  estado: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento?: string;
}
