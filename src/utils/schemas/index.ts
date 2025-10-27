import * as z from 'zod';
import {
  GLOBAL_REGISTER_DEFAULT_VALUES,
  AUCTIONEER_REGISTER_DEFAULT_VALUES,
  BLOG_ARTICLE_MAX_TITLE_LENGTH,
  BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from '@/constants';
import type { UserRoles } from '@/types/types';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Required' }),
  password: z.string().min(MIN_USER_PASSWORD_LENGTH, { message: 'Required' }),
  code: z.optional(z.string()),
});

export const ShippingInfoSchema = z.object({
  shippingCourier: z.string().min(1, { message: 'Required' }),
  shippingNumber: z.string().min(1, { message: 'Required' }),
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
  phoneNumber: z.string().min(5, {
    message: JSON.stringify({
      en: 'Required (Min. 5 characters)',
      es: 'Requerido (Mín. 5 caracteres)',
    }),
  }),
  profilePicture: z.string().optional(),
});

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;

export const UserRegisterSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    email: z.string().email({ message: 'Required' }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
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
      message: 'No spaces allowed.',
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
      message: 'Passwords do not match.',
    }
  );

export const AuctioneerRegisterSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    email: z.string().email({ message: 'Required' }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().min(5, { message: 'Required' }),
    address: z.string().min(1, { message: 'Required' }),
    town: z.string().min(1, { message: 'Required' }),
    province: z.string().min(1, { message: 'Required' }),
    country: z.string().min(1, { message: 'Required' }),
    postalCode: z.string().min(1, { message: 'Required' }),
    webPage: z.string().url().min(1, { message: 'Required' }),
    socialMedia: z.string().url().min(1, { message: 'Required' }),
    storeName: z.string().min(1, { message: 'Required' }),
    terms: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: 'No spaces allowed.',
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
      message: 'Passwords do not match.',
    }
  );

export const HostAuctioneerRegisterSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    email: z.string().email({ message: 'Required' }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
      }),
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().min(5, { message: 'Required' }),
    socialMedia: z.string().optional(),
    webPage: z.string().optional(),
    terms: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: 'No spaces allowed.',
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
      message: 'Passwords do not match.',
    }
  );

export const UserEditSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    phoneNumber: z.string(),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
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
      message: 'No spaces allowed.',
    }
  );

export const AuctioneerEditSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
      }),
    // dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().min(5, { message: 'Required' }),
    address: z.string().min(1, { message: 'Required' }),
    town: z.string().min(1, { message: 'Required' }),
    province: z.string().min(1, { message: 'Required' }),
    country: z.string().min(1, { message: 'Required' }),
    postalCode: z.string().min(1, { message: 'Required' }),
    webPage: z.string().url().min(1, { message: 'Required' }),
    socialMedia: z.string().url().min(1, { message: 'Required' }),
    storeName: z.string().min(1, { message: 'Required' }),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: 'No spaces allowed.',
    }
  );

export const HostAuctioneerEditSchema = z
  .object({
    name: z.string().min(1, { message: 'Required' }),
    lastName: z.string().min(1, { message: 'Required' }),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, {
        message: `Required (Min. ${MIN_USERNAME_LENGTH} characters)`,
      })
      .max(MAX_USERNAME_LENGTH, {
        message: `Max. ${MAX_USERNAME_LENGTH} characters`,
      }),
    // dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().min(5, { message: 'Required' }),
    socialMedia: z.string().optional(),
    webPage: z.string().optional(),
  })
  .refine(
    (data) => {
      const { username } = data;

      return !username.includes(' ');
    },
    {
      path: ['username'],
      message: 'No spaces allowed.',
    }
  );

export const ResetSchema = z.object({
  email: z.string().email({ message: 'Email required' }),
});

export const NewPasswordSchema = z
  .object({
    password: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
    }),
    confirmPassword: z.string().min(MIN_USER_PASSWORD_LENGTH, {
      message: `Required (Min. ${MIN_USER_PASSWORD_LENGTH} characters)`,
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
      message: 'Passwords do not match.',
    }
  );

export const getRegisterSchema = (userRole: UserRoles) => {
  let defaultValues = GLOBAL_REGISTER_DEFAULT_VALUES;

  if (userRole === 'AUCTIONEER' || userRole === 'HOST_AUCTIONEER') {
    defaultValues = { ...defaultValues, ...AUCTIONEER_REGISTER_DEFAULT_VALUES };
  }

  return { defaultValues };
};

export const NewAuctionSchema = z.object({
  title: z.string().min(1, { message: 'Required' }),
  startDate: z.string().min(1, { message: 'Required' }),
  startTime: z.string().min(1, { message: 'Required' }),
  country: z.string().min(1, { message: 'Required' }),
  category: z.string().min(1, { message: 'Required' }),
  image: z.string(),
  video: z.string(),
});

export const EditAuctionchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Required' })
    .max(20, { message: 'Title too long (Max. 20)' }),
  startDate: z.string().min(1, { message: 'Required' }),
  startTime: z.string().min(1, { message: 'Required' }),
  commingImage: z.string().optional(),
  commingVideo: z.string().optional(),
  newImage: z.string().optional(),
  newVideo: z.string().optional(),
});

export const NewBlogArticleSchema = z.object({
  title_es: z
    .string()
    .min(1, { message: 'Required' })
    .max(BLOG_ARTICLE_MAX_TITLE_LENGTH, {
      message: `Title too long (Max. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
    }),
  title_en: z
    .string()
    .min(1, { message: 'Required' })
    .max(BLOG_ARTICLE_MAX_TITLE_LENGTH, {
      message: `Title too long (Max. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
    }),
  description_es: z
    .string()
    .max(BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH, {
      message: `Description too long (Max. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
    })
    .optional(),
  description_en: z
    .string()
    .max(BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH, {
      message: `Description too long (Max. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
    })
    .optional(),
  keyWords_es: z.string().min(1, { message: 'Required' }),
  keyWords_en: z.string().min(1, { message: 'Required' }),
  coverImage: z.string().optional(),
  text1_es: z.string().min(1, { message: 'Required' }),
  text1_en: z.string().min(1, { message: 'Required' }),
  text2_es: z.string().optional(),
  text2_en: z.string().optional(),
  image1: z.string().optional(),
});
