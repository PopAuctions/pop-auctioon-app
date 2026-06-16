import * as z from 'zod';
import {
  MIN_USER_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from '@/constants';

export const LoginSchema = z.object({
  email: z.string().email({
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  code: z.optional(z.string()),
});

export const ShippingInfoSchema = z.object({
  shippingCourier: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  shippingNumber: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
});

export type ShippingInfoSchemaType = z.infer<typeof ShippingInfoSchema>;

export const PaymentSchema = z.object({
  country: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  userAddressId: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
});
export const AddressSchema = z.object({
  nameAddress: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required. Use a name to identify the address',
      es: 'Requerido. Usa un nombre para identificar la dirección',
    }),
  }),
  address: z.string().min(3, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  city: z.string().min(2, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  state: z.string().min(2, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  country: z.string().min(2, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  postalCode: z.string().min(2, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  primaryAddress: z.boolean().optional(),
});

export type AddressSchemaType = z.infer<typeof AddressSchema>;

// Edit Profile Schema
export const EditProfileSchema = z.object({
  name: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  lastName: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USERNAME_LENGTH} caracteres)`,
      }),
    })
    .max(MAX_USERNAME_LENGTH, {
      message: JSON.stringify({
        en: `Max. ${MAX_USERNAME_LENGTH} characters`,
        es: `Máx. ${MAX_USERNAME_LENGTH} caracteres`,
      }),
    })
    .refine((val) => !val.includes(' '), {
      message: JSON.stringify({
        en: 'No spaces allowed',
        es: 'No se permiten espacios',
      }),
    }),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
});

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;

export const UserRegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    lastName: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    email: z.string().email({
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
          es: `Requerido (Mín. ${MIN_USERNAME_LENGTH} caracteres)`,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Max. ${MAX_USERNAME_LENGTH} characters`,
          es: `Máx. ${MAX_USERNAME_LENGTH} caracteres`,
        }),
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
    dni: z.string().optional(),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: JSON.stringify({
        en: 'No spaces allowed.',
        es: 'No se permiten espacios.',
      }),
    }
  )
  .refine(
    (data) => {
      const { password, confirmPassword } = data;
      const passwordsMatch = password === confirmPassword;

      return passwordsMatch;
    },
    {
      path: ['password'],
      message: JSON.stringify({
        en: 'Passwords do not match.',
        es: 'Las contraseñas no coinciden.',
      }),
    }
  );

export type UserRegisterSchemaType = z.infer<typeof UserRegisterSchema>;

export const AuctioneerRegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    lastName: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    email: z.string().email({
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
          es: `Requerido (Mín. ${MIN_USERNAME_LENGTH} caracteres)`,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Max. ${MAX_USERNAME_LENGTH} characters`,
          es: `Máx. ${MAX_USERNAME_LENGTH} caracteres)`,
        }),
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
    dni: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().optional(),
    storePhoneNumber: z.string().min(5, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    cif: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    legalName: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    address: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    town: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    province: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    country: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    postalCode: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    webPage: z
      .string()
      .url()
      .min(1, {
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      }),
    socialMedia: z
      .string()
      .url()
      .min(1, {
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      }),
    storeName: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    terms: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: JSON.stringify({
        en: 'No spaces allowed.',
        es: 'No se permiten espacios.',
      }),
    }
  )
  .refine(
    (data) => {
      const { password, confirmPassword } = data;
      const passwordsMatch = password === confirmPassword;

      return passwordsMatch;
    },
    {
      path: ['password'],
      message: JSON.stringify({
        en: 'Passwords do not match.',
        es: 'Las contraseñas no coinciden.',
      }),
    }
  );

export type AuctioneerRegisterSchemaType = z.infer<
  typeof AuctioneerRegisterSchema
>;

export const UserEditSchema = z
  .object({
    name: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    lastName: z.string().min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
    phoneNumber: z.string(),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
          es: `Requerido (Mín. ${MIN_USERNAME_LENGTH} caracteres)`,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: JSON.stringify({
          en: `Max. ${MAX_USERNAME_LENGTH} characters`,
          es: `Máx. ${MAX_USERNAME_LENGTH} caracteres`,
        }),
      }),
    // dni: z.string(),
    profilePicture: z.string().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: JSON.stringify({
        en: 'No spaces allowed.',
        es: 'No se permiten espacios.',
      }),
    }
  );

export const AuctioneerEditSchema = z.object({
  legalName: z.string().min(1, { message: 'Required' }),
  name: z.string().min(1, { message: 'Required' }),
  phoneNumber: z.string().min(5, { message: 'Required' }),
  address: z.string().min(1, { message: 'Required' }),
  town: z.string().min(1, { message: 'Required' }),
  province: z.string().min(1, { message: 'Required' }),
  country: z.string().min(1, { message: 'Required' }),
  postalCode: z.string().min(1, { message: 'Required' }),
  webPage: z.string().url().min(1, { message: 'Required' }),
  socialMedia: z.string().url().min(1, { message: 'Required' }),
  cif: z.string().min(1, { message: 'Required' }),
  logo: z.string().optional(),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: JSON.stringify({
      en: 'Email required',
      es: 'Email requerido',
    }),
  }),
});

export const NewPasswordSchema = z
  .object({
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: JSON.stringify({
        en: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
        es: `Requerido (Mín. ${MIN_USER_PASSWORD_LENGTH} caracteres)`,
      }),
    }),
  })
  .refine(
    (data) => {
      const { password, confirmPassword } = data;
      const passwordsMatch = password === confirmPassword;

      return passwordsMatch;
    },
    {
      path: ['confirmPassword'],
      message: JSON.stringify({
        en: 'Passwords do not match.',
        es: 'Las contraseñas no coinciden.',
      }),
    }
  );
