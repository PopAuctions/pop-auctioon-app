import { COUNTRIES_ARRAY } from '@/constants/payment';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

describe.each([
  {
    dictionary: en,
    expected: [
      ['ANDORRA', 'Andorra'],
      ['AUSTRIA', 'Austria'],
      ['BELGIUM', 'Belgium'],
      ['BULGARIA', 'Bulgaria'],
      ['CROATIA', 'Croatia'],
      ['CYPRUS', 'Cyprus'],
      ['CZECH_REPUBLIC', 'Czech Republic'],
      ['DENMARK', 'Denmark'],
      ['SPAIN', 'Spain - Peninsula and Balearic Islands'],
      ['ESTONIA', 'Estonia'],
      ['FINLAND', 'Finland'],
      ['FRANCE', 'France'],
      ['GERMANY', 'Germany'],
      ['GREECE', 'Greece'],
      ['HUNGARY', 'Hungary'],
      ['IRELAND', 'Ireland'],
      ['ITALY', 'Italy'],
      ['LATVIA', 'Latvia'],
      ['LITHUANIA', 'Lithuania'],
      ['LUXEMBOURG', 'Luxembourg'],
      ['MALTA', 'Malta'],
      ['NETHERLANDS', 'Netherlands'],
      ['POLAND', 'Poland'],
      ['PORTUGAL', 'Portugal'],
      ['ROMANIA', 'Romania'],
      ['SLOVAKIA', 'Slovakia'],
      ['SLOVENIA', 'Slovenia'],
      ['SWEDEN', 'Sweden'],
    ],
  },
  {
    dictionary: es,
    expected: [
      ['ANDORRA', 'Andorra'],
      ['AUSTRIA', 'Austria'],
      ['BELGIUM', 'Bélgica'],
      ['BULGARIA', 'Bulgaria'],
      ['CROATIA', 'Croacia'],
      ['CYPRUS', 'Chipre'],
      ['CZECH_REPUBLIC', 'República Checa'],
      ['DENMARK', 'Dinamarca'],
      ['SPAIN', 'España - Península e Islas Baleares'],
      ['ESTONIA', 'Estonia'],
      ['FINLAND', 'Finlandia'],
      ['FRANCE', 'Francia'],
      ['GERMANY', 'Alemania'],
      ['GREECE', 'Grecia'],
      ['HUNGARY', 'Hungría'],
      ['IRELAND', 'Irlanda'],
      ['ITALY', 'Italia'],
      ['LATVIA', 'Letonia'],
      ['LITHUANIA', 'Lituania'],
      ['LUXEMBOURG', 'Luxemburgo'],
      ['MALTA', 'Malta'],
      ['NETHERLANDS', 'Países Bajos'],
      ['POLAND', 'Polonia'],
      ['PORTUGAL', 'Portugal'],
      ['ROMANIA', 'Rumania'],
      ['SLOVAKIA', 'Eslovaquia'],
      ['SLOVENIA', 'Eslovenia'],
      ['SWEDEN', 'Suecia'],
    ],
  },
])('centralized country labels', ({ dictionary, expected }) => {
  it('preserves every country value, label, and position', () => {
    expect(
      COUNTRIES_ARRAY.map((value) => [
        value,
        dictionary.displayLabels.country[value],
      ])
    ).toEqual(expected);
  });
});
