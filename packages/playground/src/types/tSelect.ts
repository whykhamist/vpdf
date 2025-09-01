export type SelectOption = HasKey & {
  label: string;
  value: any;
};

export type SelectOptions = Array<SelectOption>;
