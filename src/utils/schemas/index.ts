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
    phoneNumber: z.string().min(5, {
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

export const HostAuctioneerRegisterSchema = z
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
    phoneNumber: z.string().min(5, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
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

export const AuctioneerEditSchema = z
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
    // dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string(),
    address: z.string(),
    town: z.string(),
    province: z.string(),
    country: z.string(),
    postalCode: z.string(),
    webPage: z.string(),
    socialMedia: z.string(),
    storeName: z.string(),
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
  .superRefine((data, ctx) => {
    // Validar phoneNumber
    if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phoneNumber'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    } else if (data.phoneNumber.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phoneNumber'],
        message: JSON.stringify({
          en: 'Min. 5 characters',
          es: 'Mín. 5 caracteres',
        }),
      });
    }

    // Validar address
    if (!data.address || data.address.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }

    // Validar town
    if (!data.town || data.town.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['town'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }

    // Validar province
    if (!data.province || data.province.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['province'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }

    // Validar country
    if (!data.country || data.country.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['country'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }

    // Validar postalCode
    if (!data.postalCode || data.postalCode.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postalCode'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }

    // Validar webPage
    if (!data.webPage || data.webPage.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['webPage'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    } else {
      try {
        new URL(data.webPage);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['webPage'],
          message: JSON.stringify({
            en: 'Invalid URL',
            es: 'URL inválida',
          }),
        });
      }
    }

    // Validar socialMedia
    if (!data.socialMedia || data.socialMedia.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['socialMedia'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    } else {
      try {
        new URL(data.socialMedia);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['socialMedia'],
          message: JSON.stringify({
            en: 'Invalid URL',
            es: 'URL inválida',
          }),
        });
      }
    }

    // Validar storeName
    if (!data.storeName || data.storeName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['storeName'],
        message: JSON.stringify({
          en: 'Required',
          es: 'Requerido',
        }),
      });
    }
  });

export const HostAuctioneerEditSchema = z
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
    // dni: z.string().min(1, { message: 'Required' }),
    profilePicture: z.string().optional(),
    phoneNumber: z.string().min(5, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    }),
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
      message: JSON.stringify({
        en: 'No spaces allowed.',
        es: 'No se permiten espacios.',
      }),
    }
  );

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

export const getRegisterSchema = (userRole: UserRoles) => {
  let defaultValues = GLOBAL_REGISTER_DEFAULT_VALUES;

  if (userRole === 'AUCTIONEER' || userRole === 'HOST_AUCTIONEER') {
    defaultValues = { ...defaultValues, ...AUCTIONEER_REGISTER_DEFAULT_VALUES };
  }

  return { defaultValues };
};

export const NewAuctionSchema = z.object({
  title: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startDate: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startTime: z.string().min(1, {
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
  category: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  image: z.string(),
  video: z.string(),
});

export const EditAuctionSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .max(20, {
      message: JSON.stringify({
        en: 'Title too long (Max. 20)',
        es: 'Título muy largo (Máx. 20)',
      }),
    }),
  startDate: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startTime: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  comingImage: z.string().optional(),
  comingVideo: z.string().optional(),
  newImage: z.string().optional(),
  newVideo: z.string().optional(),
});

export const NewBlogArticleSchema = z.object({
  title_es: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .max(BLOG_ARTICLE_MAX_TITLE_LENGTH, {
      message: JSON.stringify({
        en: `Title too long (Max. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
        es: `Título muy largo (Máx. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
      }),
    }),
  title_en: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .max(BLOG_ARTICLE_MAX_TITLE_LENGTH, {
      message: JSON.stringify({
        en: `Title too long (Max. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
        es: `Título muy largo (Máx. ${BLOG_ARTICLE_MAX_TITLE_LENGTH})`,
      }),
    }),
  description_es: z
    .string()
    .max(BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH, {
      message: JSON.stringify({
        en: `Description too long (Max. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
        es: `Descripción muy larga (Máx. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
      }),
    })
    .optional(),
  description_en: z
    .string()
    .max(BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH, {
      message: JSON.stringify({
        en: `Description too long (Max. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
        es: `Descripción muy larga (Máx. ${BLOG_ARTICLE_MAX_DESCRIPTION_LENGTH})`,
      }),
    })
    .optional(),
  keyWords_es: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  keyWords_en: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  coverImage: z.string().optional(),
  text1_es: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  text1_en: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  text2_es: z.string().optional(),
  text2_en: z.string().optional(),
  image1: z.string().optional(),
});
