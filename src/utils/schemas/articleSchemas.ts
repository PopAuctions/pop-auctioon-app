import * as z from 'zod';
import { ONLY_INTEGERS_EMPTY_REGEX, ONLY_INTEGERS_REGEX } from '@/constants';

const commonSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .max(
      25,
      JSON.stringify({
        en: 'Max 25 characters',
        es: 'Máximo 25 caracteres',
      })
    ),
  state: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startingPrice: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .regex(ONLY_INTEGERS_REGEX, {
      message: JSON.stringify({
        en: 'Must contain only numbers',
        es: 'Debe contener solo números',
      }),
    })
    .refine((val) => parseInt(val) >= 1, {
      message: JSON.stringify({
        en: 'The minimum starting price is 1',
        es: 'El precio inicial mínimo es 1',
      }),
    }),
  estimatedValue: z.string().regex(ONLY_INTEGERS_EMPTY_REGEX, {
    message: JSON.stringify({
      en: 'Must contain only numbers',
      es: 'Debe contener solo números',
    }),
  }),
  reservePrice: z.string().regex(ONLY_INTEGERS_EMPTY_REGEX, {
    message: JSON.stringify({
      en: 'Must contain only numbers',
      es: 'Debe contener solo números',
    }),
  }),
  images: z.string().optional(),
  codeNumber: z.string().optional(),
  description: z.string().min(5, {
    message: JSON.stringify({
      en: 'Required (Min. 5)',
      es: 'Requerido (Min. 5)',
    }),
  }),
  observations: z.string().optional(),
});

export const NewArticleSchemaBags = commonSchema
  .extend({
    material: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    brand: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    color: z.string().optional(),
    smell: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  })
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return width || allEmpty || allFilled;
    },
    {
      path: ['width'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  )
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return length || allEmpty || allFilled;
    },
    {
      path: ['length'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  )
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return height || allEmpty || allFilled;
    },
    {
      path: ['height'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  );

export const NewArticleSchemaJewrly = commonSchema.extend({
  material: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  brand: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  size: z.string().optional(),
  color: z.string().optional(),
  documentation: z.boolean().optional(),
});

export const NewArticleSchemaWatches = commonSchema.extend({
  brand: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  faceDiameter: z.string().optional(),
  movement: z.string().optional(),
  strapMaterial: z.string().optional(),
  boxMaterial: z.string().optional(),
  color: z.string().optional(),
  year: z.string().optional(),
  box: z.boolean().optional(),
  documentation: z.boolean().optional(),
});

export const NewArticleSchemaArt = commonSchema
  .extend({
    artType: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    weight: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  })
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return width || allEmpty || allFilled;
    },
    {
      path: ['width'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  )
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return length || allEmpty || allFilled;
    },
    {
      path: ['length'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  )
  .refine(
    (data) => {
      const { length, width, height } = data;
      const allEmpty = !length && !width && !height;
      const allFilled = length && width && height;

      return height || allEmpty || allFilled;
    },
    {
      path: ['height'],
      message: JSON.stringify({
        en: 'All or none of the measurements are required',
        es: 'Todas o ninguna de las medidas son requeridas',
      }),
    }
  );

const defaultCommonValues = {
  title: '',
  state: '',
  startingPrice: '',
  estimatedValue: '',
  reservePrice: '',
  images: '',
  codeNumber: '',
  description: '',
  observations: '',
};

export const DEFAULT_VALUES_MAP = {
  BAGS: {
    ...defaultCommonValues,
    material: '',
    brand: '',
    color: '',
    smell: '',
    length: '',
    width: '',
    height: '',
  },
  JEWERLY: {
    ...defaultCommonValues,
    material: '',
    brand: '',
    size: '',
    color: '',
    documentation: false,
  },
  WATCHES: {
    ...defaultCommonValues,
    brand: '',
    faceDiameter: '',
    movement: '',
    strapMaterial: '',
    boxMaterial: '',
    color: '',
    year: '',
    box: false,
    documentation: false,
  },
  ART: {
    ...defaultCommonValues,
    artType: '',
    weight: '',
    length: '',
    width: '',
    height: '',
  },
} as const;
