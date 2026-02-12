export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O'
}

export interface GenderOption {
  label: string;
  value: Gender;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { label: 'Masculino', value: Gender.MALE },
  { label: 'Feminino', value: Gender.FEMALE },
  { label: 'Outro', value: Gender.OTHER }
];
