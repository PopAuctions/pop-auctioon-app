import * as z from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';
import { ONLY_INTEGERS_EMPTY_REGEX, ONLY_INTEGERS_REGEX } from '@/constants';
import { AuctionCategories } from '@/types/types';

const commonSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: createValidationMessage('validation.required'),
    })
    .max(25, createValidationMessage('validation.max25Characters')),
  state: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  startingPrice: z
    .string()
    .min(1, {
      message: createValidationMessage('validation.required'),
    })
    .regex(ONLY_INTEGERS_REGEX, {
      message: createValidationMessage('validation.numbersOnly'),
    })
    .refine((val) => parseInt(val) >= 1, {
      message: createValidationMessage('validation.minimumStartingPrice'),
    }),
  estimatedValue: z
    .string()
    .regex(ONLY_INTEGERS_EMPTY_REGEX, {
      message: createValidationMessage('validation.numbersOnly'),
    })
    .refine((value) => value === '' || Number(value) >= 1, {
      message: createValidationMessage('validation.estimatedValueMinimum'),
    })
    .optional(),
  reservePrice: z
    .string()
    .regex(ONLY_INTEGERS_EMPTY_REGEX, {
      message: createValidationMessage('validation.numbersOnly'),
    })
    .optional(),
  images: z.string().optional(),
  codeNumber: z.string().optional(),
  description: z.string().min(5, {
    message: createValidationMessage('validation.requiredMin5'),
  }),
  observations: z.string().optional(),
});

export const NewArticleSchemaBags = commonSchema
  .extend({
    material: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    brand: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    color: z.string().optional(),
    smell: z.string().min(1, {
      message: createValidationMessage('validation.required'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
    }
  );

export const NewArticleSchemaJewrly = commonSchema.extend({
  material: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  brand: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  size: z.string().optional(),
  color: z.string().optional(),
  documentation: z.boolean().optional(),
});

export const NewArticleSchemaWatches = commonSchema.extend({
  brand: z.string().min(1, {
    message: createValidationMessage('validation.required'),
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
      message: createValidationMessage('validation.required'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
    }
  );

export const NewArticleSchemaAll = commonSchema
  .extend({
    material: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    smell: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    artType: z.string().optional(),
    weight: z.string().optional(),
    faceDiameter: z.string().optional(),
    movement: z.string().optional(),
    strapMaterial: z.string().optional(),
    boxMaterial: z.string().optional(),
    year: z.string().optional(),
    box: z.boolean().optional(),
    documentation: z.boolean().optional(),
    size: z.string().optional(),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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
      message: createValidationMessage('validation.allMeasurementsOrNone'),
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

export const DEFAULT_VALUES_MAP: ArticleDefaultValuesMap = {
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
  ALL: {
    ...defaultCommonValues,
    material: '',
    brand: '',
    color: '',
    smell: '',
    length: '',
    width: '',
    height: '',
    artType: '',
    weight: '',
    faceDiameter: '',
    movement: '',
    strapMaterial: '',
    boxMaterial: '',
    year: '',
    box: false,
    documentation: false,
    size: '',
  },
} as const;

export const ArticleSchemasMap = {
  BAGS: NewArticleSchemaBags,
  JEWERLY: NewArticleSchemaJewrly,
  WATCHES: NewArticleSchemaWatches,
  ART: NewArticleSchemaArt,
  ALL: NewArticleSchemaAll,
} as const;

type ArticleDefaultValuesMap = {
  [K in AuctionCategories]: z.infer<(typeof ArticleSchemasMap)[K]>;
};

export type SchemaFor<C extends AuctionCategories> =
  (typeof ArticleSchemasMap)[C];

export type ArticleFormValues<C extends AuctionCategories> = z.infer<
  SchemaFor<C>
>;

export const requireEstimatedValue = <T extends z.ZodTypeAny>(
  schema: T
): z.ZodType<z.output<T>, z.input<T>> =>
  schema.superRefine((data, ctx) => {
    const estimatedValue = (
      data as {
        estimatedValue?: string;
      }
    ).estimatedValue;

    if (!estimatedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['estimatedValue'],
        message: createValidationMessage('validation.required'),
      });
    }
  }) as z.ZodType<z.output<T>, z.input<T>>;
