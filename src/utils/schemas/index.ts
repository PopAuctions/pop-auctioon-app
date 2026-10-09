import * as z from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';
import {
  MIN_USER_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from '@/constants';

export const LoginSchema = z.object({
  email: z.string().email({
    message: createValidationMessage('validation.required'),
  }),
  password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
    message: createValidationMessage('validation.required'),
  }),
  code: z.optional(z.string()),
});

export const ShippingInfoSchema = z.object({
  shippingCourier: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  shippingNumber: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
});

export type ShippingInfoSchemaType = z.infer<typeof ShippingInfoSchema>;

export const PaymentSchema = z.object({
  country: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  userAddressId: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
});
export const AddressSchema = z.object({
  nameAddress: z.string().min(1, {
    message: createValidationMessage('validation.addressNameRequired'),
  }),
  address: z.string().min(3, {
    message: createValidationMessage('validation.required'),
  }),
  city: z.string().min(2, {
    message: createValidationMessage('validation.required'),
  }),
  state: z.string().min(2, {
    message: createValidationMessage('validation.required'),
  }),
  country: z.string().min(2, {
    message: createValidationMessage('validation.required'),
  }),
  postalCode: z.string().min(2, {
    message: createValidationMessage('validation.required'),
  }),
  primaryAddress: z.boolean().optional(),
});

export type AddressSchemaType = z.infer<typeof AddressSchema>;

// Edit Profile Schema
export const EditProfileSchema = z.object({
  name: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  lastName: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH, {
      message: createValidationMessage('validation.usernameMinLength', {
        min: MIN_USERNAME_LENGTH,
      }),
    })
    .max(MAX_USERNAME_LENGTH, {
      message: createValidationMessage('validation.usernameMaxLength', {
        max: MAX_USERNAME_LENGTH,
      }),
    })
    .refine((val) => !val.includes(' '), {
      message: createValidationMessage('validation.noSpacesAllowed'),
    }),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
});

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;

export const UserRegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    lastName: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    email: z.string().email({
      message: createValidationMessage('validation.required'),
    }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: createValidationMessage('validation.usernameMinLength', {
          min: MIN_USERNAME_LENGTH,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: createValidationMessage('validation.usernameMaxLength', {
          max: MAX_USERNAME_LENGTH,
        }),
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
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
      message: createValidationMessage('validation.noSpacesAllowedPeriod'),
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
      message: createValidationMessage('validation.passwordMismatchPeriod'),
    }
  );

export type UserRegisterSchemaType = z.infer<typeof UserRegisterSchema>;

export const AuctioneerRegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    lastName: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    email: z.string().email({
      message: createValidationMessage('validation.required'),
    }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: createValidationMessage('validation.usernameMinLength', {
          min: MIN_USERNAME_LENGTH,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: createValidationMessage(
          'validation.usernameMaxLengthAuctioneer',
          { max: MAX_USERNAME_LENGTH }
        ),
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
      }),
    }),
    dni: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().optional(),
    storePhoneNumber: z.string().min(5, {
      message: createValidationMessage('validation.required'),
    }),
    cif: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    legalName: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    address: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    town: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    province: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    country: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    postalCode: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    webPage: z
      .string()
      .url()
      .min(1, {
        message: createValidationMessage('validation.required'),
      }),
    socialMedia: z
      .string()
      .url()
      .min(1, {
        message: createValidationMessage('validation.required'),
      }),
    storeName: z.string().min(1, {
      message: createValidationMessage('validation.required'),
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
      message: createValidationMessage('validation.noSpacesAllowedPeriod'),
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
      message: createValidationMessage('validation.passwordMismatchPeriod'),
    }
  );

export type AuctioneerRegisterSchemaType = z.infer<
  typeof AuctioneerRegisterSchema
>;

export const UserEditSchema = z
  .object({
    name: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    lastName: z.string().min(1, {
      message: createValidationMessage('validation.required'),
    }),
    phoneNumber: z.string(),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: createValidationMessage('validation.usernameMinLength', {
          min: MIN_USERNAME_LENGTH,
        }),
      })
      .max(MAX_USERNAME_LENGTH, {
        message: createValidationMessage('validation.usernameMaxLength', {
          max: MAX_USERNAME_LENGTH,
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
      message: createValidationMessage('validation.noSpacesAllowedPeriod'),
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
    message: createValidationMessage('validation.emailRequired'),
  }),
});

export const NewPasswordSchema = z
  .object({
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
      }),
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: createValidationMessage('validation.passwordMinLength', {
        min: MIN_USER_PASSWORD_LENGTH,
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
      message: createValidationMessage('validation.passwordMismatchPeriod'),
    }
  );
