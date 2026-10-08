/**
 * Constantes relacionadas con artículos:
 * - Estados, marcas, colores, materiales
 * - Categorías y tipos de productos
 * - Filtros de precio y categorías
 */
import type {
  ArticleSecondChanceStatus,
  CategoryFilter,
  Lang,
} from '@/types/types';
import type { Database } from '@/types/supabase';

export type ArticleStateValue = Database['public']['Enums']['ArticleState'];
export type ArticleSmellValue = Database['public']['Enums']['ArticleSmell'];

export const ARTICLE_STATE_VALUES = [
  'NEVER_WORN_WITH_TAG',
  'NEVER_WORN',
  'VERY_GOOD_CONDITION',
  'GOOD_CONDITION',
  'FAIR_CONDITION',
] as const satisfies readonly ArticleStateValue[];

export enum ArticleStatus {
  NOT_PUBLISHED = 'NOT_PUBLISHED',
  NEED_CHANGES = 'NEED_CHANGES',
  CHANGES_MADE = 'CHANGES_MADE',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export const ARTICLE_BRANDS = [
  { value: 'NON_SIGNE', label: 'non signé' },
  { value: 'A_LANGE_SOHNE', label: 'A. Lange & Söhne' },
  { value: 'AUDEMARS_PIGUET', label: 'Audemars Piguet' },
  { value: 'BALENCIAGA', label: 'Balenciaga' },
  { value: 'BALMAIN', label: 'Balmain' },
  { value: 'BAUME_MERCIER', label: 'Baume & Mercier' },
  { value: 'BELL_ROSS', label: 'Bell & Ross' },
  { value: 'BLANCPAIN', label: 'Blancpain' },
  { value: 'BOVET', label: 'Bovet' },
  { value: 'BOUCHERON', label: 'Boucheron' },
  { value: 'BOTTEGA_VENETA', label: 'Bottega Veneta' },
  { value: 'BREGUET', label: 'Breguet' },
  { value: 'BREITLING', label: 'Breitling' },
  { value: 'BUCCELLATI', label: 'Buccellati' },
  { value: 'BULGARI', label: 'Bulgari' },
  { value: 'BURBERRY', label: 'Burberry' },
  { value: 'CARTIER', label: 'Cartier' },
  { value: 'CELINE', label: 'Celine' },
  { value: 'CHANEL', label: 'Chanel' },
  { value: 'CHAUMET', label: 'Chaumet' },
  { value: 'CHLOE', label: 'Chloe' },
  { value: 'CHOPARD', label: 'Chopard' },
  { value: 'CHRISTIAN_DIOR', label: 'Christian Dior' },
  { value: 'CHRISTIAN_LOUBOUTIN', label: 'Christian Louboutin' },
  { value: 'CORUM', label: 'Corum' },
  { value: 'DAMIANI', label: 'Damiani' },
  { value: 'DAVID_YURMAN', label: 'David Yurman' },
  { value: 'DE_BEERS', label: 'De Beers' },
  { value: 'DIOR_HOMME', label: 'Dior Homme' },
  { value: 'DODO', label: 'Dodo' },
  { value: 'DOLCE_GABBANA', label: 'Dolce Gabbana' },
  { value: 'D_G', label: 'D&G' },
  { value: 'FABERGE', label: 'Fabergé' },
  { value: 'FENDI', label: 'Fendi' },
  { value: 'FERRAGAMO', label: 'Ferragamo' },
  { value: 'FP_JOURNE', label: 'F.P. Journe' },
  { value: 'FRANCK_MULLER', label: 'Franck Muller' },
  { value: 'GARRARD', label: 'Garrard' },
  { value: 'GIVENCHY', label: 'Givenchy' },
  { value: 'GLASHUTTE_ORIGINAL', label: 'Glashütte Original' },
  { value: 'GOYARD', label: 'Goyard' },
  { value: 'GRAND_SEIKO', label: 'Grand Seiko' },
  { value: 'GRAFF', label: 'Graff' },
  { value: 'GUCCI', label: 'Gucci' },
  { value: 'HARRY_WINSTON', label: 'Harry Winston' },
  { value: 'HERMES', label: 'Hermès' },
  { value: 'HUBLOT', label: 'Hublot' },
  { value: 'IWC_SCHAFFHAUSEN', label: 'IWC Schaffhausen' },
  { value: 'JACQUEMUS', label: 'Jacquemus' },
  { value: 'JAEGER_LECOULTRE', label: 'Jaeger-LeCoultre' },
  { value: 'KWIAT', label: 'Kwiat' },
  { value: 'LONGINES', label: 'Longines' },
  { value: 'LOEWE', label: 'Loewe' },
  { value: 'LORENZ_BAUMER', label: 'Lorenz Bäumer' },
  { value: 'LOUIS_VUITTON', label: 'Louis Vuitton' },
  { value: 'MAURICE_LACROIX', label: 'Maurice Lacroix' },
  { value: 'MESSIKA', label: 'Messika' },
  { value: 'MIKIMOTO', label: 'Mikimoto' },
  { value: 'MIU_MIU', label: 'Miu Miu' },
  { value: 'MONTBLANC', label: 'Montblanc' },
  { value: 'MOUSSAIEFF', label: 'Moussaieff' },
  { value: 'NOOR_FARES', label: 'Noor Fares' },
  { value: 'OMEGA', label: 'Omega' },
  { value: 'OLE_LYNGGAARD_COPENHAGEN', label: 'Ole Lynggaard Copenhagen' },
  { value: 'PANERAI', label: 'Panerai' },
  { value: 'PARMIGIANI_FLEURIER', label: 'Parmigiani Fleurier' },
  { value: 'PATEK_PHILIPPE', label: 'Patek Philippe' },
  { value: 'PIAGET', label: 'Piaget' },
  { value: 'POMELLATO', label: 'Pomellato' },
  { value: 'PRADA', label: 'Prada' },
  { value: 'RICHARD_MILLE', label: 'Richard Mille' },
  { value: 'ROBERTO_COIN', label: 'Roberto Coin' },
  { value: 'ROLEX', label: 'Rolex' },
  { value: 'SAINT_LAURENT', label: 'Saint Laurent' },
  { value: 'SHAUN_LEANE', label: 'Shaun Leane' },
  { value: 'STEPHEN_WEBSTER', label: 'Stephen Webster' },
  { value: 'TAG_HEUER', label: 'TAG Heuer' },
  { value: 'TAFFIN', label: 'Taffin' },
  { value: 'TIFFANY_CO', label: 'Tiffany & Co' },
  { value: 'TUDOR', label: 'Tudor' },
  { value: 'ULYSSE_NARDIN', label: 'Ulysse Nardin' },
  { value: 'VACHERON_CONSTANTIN', label: 'Vacheron Constantin' },
  { value: 'VALENTINO_GARAVANI', label: 'Valentino Garavani' },
  { value: 'VAN_CLEEF_ARPELS', label: 'Van Cleef & Arpels' },
  { value: 'VERSACE', label: 'Versace' },
  { value: 'ZENITH', label: 'Zenith' },
];

export const ARTICLE_BRANDS_LABELS = {
  NON_SIGNE: 'non signé',
  A_LANGE_SOHNE: 'A. Lange & Söhne',
  AUDEMARS_PIGUET: 'Audemars Piguet',
  BALENCIAGA: 'Balenciaga',
  BALMAIN: 'Balmain',
  BAUME_MERCIER: 'Baume & Mercier',
  BELL_ROSS: 'Bell & Ross',
  BLANCPAIN: 'Blancpain',
  BOVET: 'Bovet',
  BOUCHERON: 'Boucheron',
  BOTTEGA_VENETA: 'Bottega Veneta',
  BREGUET: 'Breguet',
  BREITLING: 'Breitling',
  BUCCELLATI: 'Buccellati',
  BULGARI: 'Bulgari',
  BURBERRY: 'Burberry',
  CARTIER: 'Cartier',
  CELINE: 'Celine',
  CHANEL: 'Chanel',
  CHAUMET: 'Chaumet',
  CHLOE: 'Chloe',
  CHOPARD: 'Chopard',
  CHRISTIAN_DIOR: 'Christian Dior',
  CHRISTIAN_LOUBOUTIN: 'Christian Louboutin',
  CORUM: 'Corum',
  DAMIANI: 'Damiani',
  DAVID_YURMAN: 'David Yurman',
  DE_BEERS: 'De Beers',
  DIOR_HOMME: 'Dior Homme',
  DODO: 'Dodo',
  DOLCE_GABBANA: 'Dolce Gabbana',
  D_G: 'D&G',
  FABERGE: 'Fabergé',
  FENDI: 'Fendi',
  FERRAGAMO: 'Ferragamo',
  FP_JOURNE: 'F.P. Journe',
  FRANCK_MULLER: 'Franck Muller',
  GARRARD: 'Garrard',
  GIVENCHY: 'Givenchy',
  GLASHUTTE_ORIGINAL: 'Glashütte Original',
  GOYARD: 'Goyard',
  GRAND_SEIKO: 'Grand Seiko',
  GRAFF: 'Graff',
  GUCCI: 'Gucci',
  HARRY_WINSTON: 'Harry Winston',
  HERMES: 'Hermès',
  HUBLOT: 'Hublot',
  IWC_SCHAFFHAUSEN: 'IWC Schaffhausen',
  JACQUEMUS: 'Jacquemus',
  JAEGER_LECOULTRE: 'Jaeger-LeCoultre',
  KWIAT: 'Kwiat',
  LONGINES: 'Longines',
  LOEWE: 'Loewe',
  LORENZ_BAUMER: 'Lorenz Bäumer',
  LOUIS_VUITTON: 'Louis Vuitton',
  MAURICE_LACROIX: 'Maurice Lacroix',
  MESSIKA: 'Messika',
  MIKIMOTO: 'Mikimoto',
  MIU_MIU: 'Miu Miu',
  MONTBLANC: 'Montblanc',
  MOUSSAIEFF: 'Moussaieff',
  NOOR_FARES: 'Noor Fares',
  OMEGA: 'Omega',
  OLE_LYNGGAARD_COPENHAGEN: 'Ole Lynggaard Copenhagen',
  PANERAI: 'Panerai',
  PARMIGIANI_FLEURIER: 'Parmigiani Fleurier',
  PATEK_PHILIPPE: 'Patek Philippe',
  PIAGET: 'Piaget',
  POMELLATO: 'Pomellato',
  PRADA: 'Prada',
  RICHARD_MILLE: 'Richard Mille',
  ROBERTO_COIN: 'Roberto Coin',
  ROLEX: 'Rolex',
  SAINT_LAURENT: 'Saint Laurent',
  SHAUN_LEANE: 'Shaun Leane',
  STEPHEN_WEBSTER: 'Stephen Webster',
  TAG_HEUER: 'TAG Heuer',
  TAFFIN: 'Taffin',
  TIFFANY_CO: 'Tiffany & Co',
  TUDOR: 'Tudor',
  ULYSSE_NARDIN: 'Ulysse Nardin',
  VACHERON_CONSTANTIN: 'Vacheron Constantin',
  VALENTINO_GARAVANI: 'Valentino Garavani',
  VAN_CLEEF_ARPELS: 'Van Cleef & Arpels',
  VERSACE: 'Versace',
  ZENITH: 'Zenith',
};

export const ARTICLE_COLOR_VALUES = [
  'MULTICOLOUR',
  'OTHER',
  'BEIGE',
  'BLACK',
  'BLUE',
  'BROWN',
  'BURGUNDY',
  'CAMEL',
  'CHARCOAL',
  'ECRU',
  'GOLD',
  'GREEN',
  'GREY',
  'KHAKI',
  'METALLIC',
  'NAVY',
  'ORANGE',
  'PINK',
  'PURPLE',
  'RED',
  'SILVER',
  'TURQUOISE',
  'WHITE',
  'YELLOW',
] as const;

export type ArticleColorValue = (typeof ARTICLE_COLOR_VALUES)[number];

export const ARTICLE_MATERIAL_VALUES = [
  'CASHMERE',
  'CANVAS',
  'CLOTH',
  'COTTON',
  'COTTON_ELASTHANE',
  'CRYSTAL',
  'DENIM_JEANS',
  'EXOTIC_LEATHERS',
  'FAUX_FUR',
  'FUR',
  'GLASS',
  'GLITTER',
  'GOLD_PLATED',
  'LACE',
  'LEATHER',
  'LINEN',
  'LYCRA',
  'METAL',
  'NOT_SPECIFIED',
  'OTHER',
  'PATENT_LEATHER',
  'PEARL',
  'PINK_GOLD',
  'PLASTIC',
  'POLYAMIDE',
  'POLYESTER',
  'PONY_STYLE_CALFSKIN',
  'RUBBER',
  'SILK',
  'SILVER',
  'SILVER_PLATED',
  'SPANDEX',
  'SPONGE',
  'STEEL',
  'SUEDE',
  'SYNTHETIC',
  'TWEED',
  'VEGAN_LEATHER',
  'VELVET',
  'VINYL',
  'VISCOSE',
  'WHITE_GOLD',
  'WICKER',
  'WOOL',
  'YELLOW_GOLD',
] as const;

export type ArticleMaterialValue = (typeof ARTICLE_MATERIAL_VALUES)[number];

export function hasArticleMaterialDisplayLabel(
  value: string
): value is ArticleMaterialValue {
  return (
    value !== 'CANVAS' &&
    (ARTICLE_MATERIAL_VALUES as readonly string[]).includes(value)
  );
}

export const ALL_STRAP_MATERIAL_VALUES = [
  'ALUMINUM',
  'BRASS',
  'CERAMIC',
  'COW_LEATHER',
  'GOLD_PLATED',
  'LEATHER',
  'LIZARD_LEATHER',
  'ALLIGATOR_LEATHER',
  'OSTRICH_LEATHER',
  'PLASTIC',
  'PLATINUM',
  'SATIN',
  'SAPPHIRE_CRYSTAL',
  'SHARK_LEATHER',
  'SILICONE',
  'SILVER',
  'SNAKE_LEATHER',
  'STEEL',
  'STEEL_AND_GOLD',
  'TEXTILE',
  'TITANIUM',
  'RED_GOLD',
  'ROSE_GOLD',
  'ROSE_GOLD_AND_STEEL',
  'WHITE_GOLD',
  'YELLOW_GOLD',
  'UNSPECIFIED',
  'RUBBER',
] as const;

export type StrapMaterialValue = (typeof ALL_STRAP_MATERIAL_VALUES)[number];

const DEFAULT_STRAP_MATERIAL_VALUES: readonly StrapMaterialValue[] = [
  'ALUMINUM',
  'BRASS',
  'CERAMIC',
  'COW_LEATHER',
  'GOLD_PLATED',
  'LEATHER',
  'LIZARD_LEATHER',
  'ALLIGATOR_LEATHER',
  'OSTRICH_LEATHER',
  'PLASTIC',
  'PLATINUM',
  'SATIN',
  'SAPPHIRE_CRYSTAL',
  'SHARK_LEATHER',
  'SILICONE',
  'SILVER',
  'SNAKE_LEATHER',
  'STEEL',
  'STEEL_AND_GOLD',
  'TEXTILE',
  'TITANIUM',
  'RED_GOLD',
  'ROSE_GOLD',
  'ROSE_GOLD_AND_STEEL',
  'WHITE_GOLD',
  'YELLOW_GOLD',
  'UNSPECIFIED',
];

const STRAP_MATERIAL_VALUE_OVERRIDES: Partial<
  Record<Lang, readonly StrapMaterialValue[]>
> = {
  es: [
    'STEEL',
    'STEEL_AND_GOLD',
    'ALUMINUM',
    'GOLD_PLATED',
    'RUBBER',
    'CERAMIC',
    'BRASS',
    'YELLOW_GOLD',
    'WHITE_GOLD',
    'RED_GOLD',
    'ROSE_GOLD',
    'LEATHER',
    'ALLIGATOR_LEATHER',
    'OSTRICH_LEATHER',
    'LIZARD_LEATHER',
    'SNAKE_LEATHER',
    'SHARK_LEATHER',
    'COW_LEATHER',
    'PLASTIC',
    'SILVER',
    'PLATINUM',
    'SATIN',
    'SILICONE',
    'TEXTILE',
    'TITANIUM',
    'UNSPECIFIED',
  ],
};

export function getStrapMaterialValues(
  locale: Lang
): readonly StrapMaterialValue[] {
  return (
    STRAP_MATERIAL_VALUE_OVERRIDES[locale] ?? DEFAULT_STRAP_MATERIAL_VALUES
  );
}

export function isAvailableStrapMaterialValue(
  locale: Lang,
  value: string
): value is StrapMaterialValue {
  return (getStrapMaterialValues(locale) as readonly string[]).includes(value);
}

export const BOX_MATERIAL_VALUES = [
  'ALUMINUM',
  'BRASS',
  'BRONZE',
  'CARBON',
  'CERAMIC',
  'SAPPHIRE_CRYSTAL',
  'GOLD_PLATED',
  'PALLADIUM',
  'PLASTIC',
  'PLATINUM',
  'SILVER',
  'STEEL',
  'STEEL_AND_GOLD',
  'TANTALUM',
  'TITANIUM',
  'TUNGSTEN',
  'RED_GOLD',
  'ROSE_GOLD',
  'ROSE_GOLD_AND_STEEL',
  'WHITE_GOLD',
  'WHITE_GOLD_AND_STEEL',
  'YELLOW_GOLD',
  'YELLOW_GOLD_AND_STEEL',
  'UNSPECIFIED',
] as const;

export type BoxMaterialValue = (typeof BOX_MATERIAL_VALUES)[number];

const BOX_MATERIAL_VALUE_ORDER_OVERRIDES: Partial<
  Record<Lang, readonly BoxMaterialValue[]>
> = {
  es: [
    'STEEL',
    'STEEL_AND_GOLD',
    'ALUMINUM',
    'GOLD_PLATED',
    'BRASS',
    'BRONZE',
    'CARBON',
    'CERAMIC',
    'SAPPHIRE_CRYSTAL',
    'PALLADIUM',
    'PLASTIC',
    'PLATINUM',
    'SILVER',
    'TANTALUM',
    'TITANIUM',
    'TUNGSTEN',
    'RED_GOLD',
    'ROSE_GOLD',
    'ROSE_GOLD_AND_STEEL',
    'WHITE_GOLD',
    'WHITE_GOLD_AND_STEEL',
    'YELLOW_GOLD',
    'YELLOW_GOLD_AND_STEEL',
    'UNSPECIFIED',
  ],
};

export function getBoxMaterialValues(
  locale: Lang
): readonly BoxMaterialValue[] {
  return BOX_MATERIAL_VALUE_ORDER_OVERRIDES[locale] ?? BOX_MATERIAL_VALUES;
}

export const ARTICLE_MATERIAL_FILTER_VALUES = ARTICLE_MATERIAL_VALUES.filter(
  (value): value is Exclude<ArticleMaterialValue, 'CANVAS'> =>
    value !== 'CANVAS'
);

export const ARTICLE_SMELL_VALUES = [
  'TOBACCO',
  'PERFUME',
  'HUMIDITY',
  'OTHER',
  'NO_SMELL',
] as const satisfies readonly ArticleSmellValue[];

export const WATCH_MOVEMENT_VALUES = [
  'AUTOMATIC',
  'QUARTZ',
  'MANUAL_WINDING',
  'SMART_WATCH',
  'SOLAR',
  'OTHER',
] as const;

export type WatchMovementValue = (typeof WATCH_MOVEMENT_VALUES)[number];

export const ART_TYPE_VALUES = [
  'OTHER',
  'ANTIQUE',
  'CERAMIC',
  'COLLECTIBLE',
  'DRAWING',
  'FURNITURE',
  'GLASS_ART',
  'METAL_ART',
  'PAINTING',
  'SCULPTURE',
  'WOOD_ART',
] as const;

export type ArtTypeValue = (typeof ART_TYPE_VALUES)[number];

export const ARTICLE_CATEGORIES_FILTER_LIST: Record<string, CategoryFilter[]> =
  {
    es: [
      { value: 'BAG', label: 'Bolso' },
      { value: 'JEWERLY', label: 'Joya' },
      { value: 'WATCH', label: 'Reloj' },
      { value: 'ART', label: 'Arte' },
    ],
    en: [
      { value: 'BAG', label: 'Bag' },
      { value: 'JEWERLY', label: 'Jewelry' },
      { value: 'WATCH', label: 'Watch' },
      { value: 'ART', label: 'Art' },
    ],
  };

export const ONLINE_STORE_ARTICLE_STATUS_VALUES = [
  'NOT_AVAILABLE',
  'AVAILABLE',
  'SOLD',
] as const satisfies readonly ArticleSecondChanceStatus[];

export const ARTICLE_IMAGES_MAX = 10;

export enum WonArticleStatus {
  NOT_PAID = 'NOT_PAID',
  DRAFT = 'DRAFT',
  PAID = 'PAID',
}
