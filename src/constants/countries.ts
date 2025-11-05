export type CountryValue =
  | 'ANDORRA'
  | 'AUSTRIA'
  | 'BELGIUM'
  | 'BULGARIA'
  | 'CROATIA'
  | 'CYPRUS'
  | 'CZECH_REPUBLIC'
  | 'DENMARK'
  | 'SPAIN'
  | 'ESTONIA'
  | 'FINLAND'
  | 'FRANCE'
  | 'GERMANY'
  | 'GREECE'
  | 'HUNGARY'
  | 'IRELAND'
  | 'ITALY'
  | 'LATVIA'
  | 'LITHUANIA'
  | 'LUXEMBOURG'
  | 'MALTA'
  | 'NETHERLANDS'
  | 'POLAND'
  | 'PORTUGAL'
  | 'ROMANIA'
  | 'SLOVAKIA'
  | 'SLOVENIA'
  | 'SWEDEN';

export type CountryObject = {
  label: string;
  value: CountryValue;
};

export type Countries = {
  es: CountryObject[];
  en: CountryObject[];
};

export const COUNTRIES_ARRAY: CountryValue[] = [
  'ANDORRA',
  'AUSTRIA',
  'BELGIUM',
  'BULGARIA',
  'CROATIA',
  'CYPRUS',
  'CZECH_REPUBLIC',
  'DENMARK',
  'SPAIN',
  'ESTONIA',
  'FINLAND',
  'FRANCE',
  'GERMANY',
  'GREECE',
  'HUNGARY',
  'IRELAND',
  'ITALY',
  'LATVIA',
  'LITHUANIA',
  'LUXEMBOURG',
  'MALTA',
  'NETHERLANDS',
  'POLAND',
  'PORTUGAL',
  'ROMANIA',
  'SLOVAKIA',
  'SLOVENIA',
  'SWEDEN',
] as const;

export const COUNTRIES_MAP: Countries = {
  es: [
    { label: 'Andorra', value: 'ANDORRA' },
    { label: 'Austria', value: 'AUSTRIA' },
    { label: 'Bélgica', value: 'BELGIUM' },
    { label: 'Bulgaria', value: 'BULGARIA' },
    { label: 'Croacia', value: 'CROATIA' },
    { label: 'Chipre', value: 'CYPRUS' },
    { label: 'República Checa', value: 'CZECH_REPUBLIC' },
    { label: 'Dinamarca', value: 'DENMARK' },
    { label: 'España', value: 'SPAIN' },
    { label: 'Estonia', value: 'ESTONIA' },
    { label: 'Finlandia', value: 'FINLAND' },
    { label: 'Francia', value: 'FRANCE' },
    { label: 'Alemania', value: 'GERMANY' },
    { label: 'Grecia', value: 'GREECE' },
    { label: 'Hungría', value: 'HUNGARY' },
    { label: 'Irlanda', value: 'IRELAND' },
    { label: 'Italia', value: 'ITALY' },
    { label: 'Letonia', value: 'LATVIA' },
    { label: 'Lituania', value: 'LITHUANIA' },
    { label: 'Luxemburgo', value: 'LUXEMBOURG' },
    { label: 'Malta', value: 'MALTA' },
    { label: 'Países Bajos', value: 'NETHERLANDS' },
    { label: 'Polonia', value: 'POLAND' },
    { label: 'Portugal', value: 'PORTUGAL' },
    { label: 'Rumania', value: 'ROMANIA' },
    { label: 'Eslovaquia', value: 'SLOVAKIA' },
    { label: 'Eslovenia', value: 'SLOVENIA' },
    { label: 'Suecia', value: 'SWEDEN' },
  ],
  en: [
    { label: 'Andorra', value: 'ANDORRA' },
    { label: 'Austria', value: 'AUSTRIA' },
    { label: 'Belgium', value: 'BELGIUM' },
    { label: 'Bulgaria', value: 'BULGARIA' },
    { label: 'Croatia', value: 'CROATIA' },
    { label: 'Cyprus', value: 'CYPRUS' },
    { label: 'Czech Republic', value: 'CZECH_REPUBLIC' },
    { label: 'Denmark', value: 'DENMARK' },
    { label: 'Spain', value: 'SPAIN' },
    { label: 'Estonia', value: 'ESTONIA' },
    { label: 'Finland', value: 'FINLAND' },
    { label: 'France', value: 'FRANCE' },
    { label: 'Germany', value: 'GERMANY' },
    { label: 'Greece', value: 'GREECE' },
    { label: 'Hungary', value: 'HUNGARY' },
    { label: 'Ireland', value: 'IRELAND' },
    { label: 'Italy', value: 'ITALY' },
    { label: 'Latvia', value: 'LATVIA' },
    { label: 'Lithuania', value: 'LITHUANIA' },
    { label: 'Luxembourg', value: 'LUXEMBOURG' },
    { label: 'Malta', value: 'MALTA' },
    { label: 'Netherlands', value: 'NETHERLANDS' },
    { label: 'Poland', value: 'POLAND' },
    { label: 'Portugal', value: 'PORTUGAL' },
    { label: 'Romania', value: 'ROMANIA' },
    { label: 'Slovakia', value: 'SLOVAKIA' },
    { label: 'Slovenia', value: 'SLOVENIA' },
    { label: 'Sweden', value: 'SWEDEN' },
  ],
};

export const COUNTRIES_MAP_LABEL: {
  es: Record<CountryValue, string>;
  en: Record<CountryValue, string>;
} = {
  es: {
    ANDORRA: 'Andorra',
    AUSTRIA: 'Austria',
    BELGIUM: 'Bélgica',
    BULGARIA: 'Bulgaria',
    CROATIA: 'Croacia',
    CYPRUS: 'Chipre',
    CZECH_REPUBLIC: 'República Checa',
    DENMARK: 'Dinamarca',
    SPAIN: 'España',
    ESTONIA: 'Estonia',
    FINLAND: 'Finlandia',
    FRANCE: 'Francia',
    GERMANY: 'Alemania',
    GREECE: 'Grecia',
    HUNGARY: 'Hungría',
    IRELAND: 'Irlanda',
    ITALY: 'Italia',
    LATVIA: 'Letonia',
    LITHUANIA: 'Lituania',
    LUXEMBOURG: 'Luxemburgo',
    MALTA: 'Malta',
    NETHERLANDS: 'Países Bajos',
    POLAND: 'Polonia',
    PORTUGAL: 'Portugal',
    ROMANIA: 'Rumania',
    SLOVAKIA: 'Eslovaquia',
    SLOVENIA: 'Eslovenia',
    SWEDEN: 'Suecia',
  },
  en: {
    ANDORRA: 'Andorra',
    AUSTRIA: 'Austria',
    BELGIUM: 'Belgium',
    BULGARIA: 'Bulgaria',
    CROATIA: 'Croatia',
    CYPRUS: 'Cyprus',
    CZECH_REPUBLIC: 'Czech Republic',
    DENMARK: 'Denmark',
    SPAIN: 'Spain',
    ESTONIA: 'Estonia',
    FINLAND: 'Finland',
    FRANCE: 'France',
    GERMANY: 'Germany',
    GREECE: 'Greece',
    HUNGARY: 'Hungary',
    IRELAND: 'Ireland',
    ITALY: 'Italy',
    LATVIA: 'Latvia',
    LITHUANIA: 'Lithuania',
    LUXEMBOURG: 'Luxembourg',
    MALTA: 'Malta',
    NETHERLANDS: 'Netherlands',
    POLAND: 'Poland',
    PORTUGAL: 'Portugal',
    ROMANIA: 'Romania',
    SLOVAKIA: 'Slovakia',
    SLOVENIA: 'Slovenia',
    SWEDEN: 'Sweden',
  },
};
