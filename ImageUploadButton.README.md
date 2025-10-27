# ImageUploadButton Component

Componente reutilizable para subir imágenes con dos modos: **simple** (una imagen) y **múltiple** (varias imágenes).

**Siempre se usa con React Hook Form + Zod + Controller**

## 🎯 Características

- ✅ Modo simple y múltiple
- ✅ Integración con React Hook Form + Zod
- ✅ Preview con thumbnails
- ✅ Botón X para eliminar imágenes
- ✅ Validación automática con errores bilingües
- ✅ Traducciones automáticas (ES/EN)
- ✅ Validación de tamaño (alerta si > 1MB)
- ✅ Permisos automáticos

---

## 📱 Modo Simple (Una imagen)

**Uso típico:** Foto de perfil, avatar, imagen de portada

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import { EditProfileSchema, type EditProfileSchemaType } from '@/utils/schemas';

function EditProfileScreen() {
  const { t, locale } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileSchemaType>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      name: '',
      profilePicture: '',
    },
  });

  const onSubmit = (data: EditProfileSchemaType) => {
    console.log('Profile picture:', data.profilePicture);
    // Subir imagen al servidor si existe
  };

  return (
    <>
      <Controller
        control={control}
        name='profilePicture'
        render={({ field: { onChange, value } }) => (
          <ImageUploadButton
            selectedImage={value || null}
            onImageSelected={onChange}
            onImageRemoved={() => onChange('')}
            disabled={false}
          />
        )}
      />
      {errors.profilePicture && (
        <CustomText
          type='error'
          className='mt-1'
        >
          {JSON.parse(errors.profilePicture.message || '{}')[locale] ||
            errors.profilePicture.message}
        </CustomText>
      )}
    </>
  );
}
```

### Props Modo Simple

| Prop              | Tipo                    | Descripción                             |
| ----------------- | ----------------------- | --------------------------------------- |
| `selectedImage`   | `string \| null`        | URI de la imagen seleccionada           |
| `onImageSelected` | `(uri: string) => void` | Callback cuando se selecciona           |
| `onImageRemoved`  | `() => void`            | Callback cuando se elimina              |
| `disabled`        | `boolean`               | Deshabilitar (opcional, default: false) |

---

---

## 📸 Modo Múltiple (Varias imágenes)

**Uso típico:** Galería de artículos, múltiples fotos de productos

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';
import {
  CreateArticleSchema,
  type CreateArticleSchemaType,
} from '@/utils/schemas';

function CreateArticleScreen() {
  const { t, locale } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateArticleSchemaType>({
    resolver: zodResolver(CreateArticleSchema),
    defaultValues: {
      title: '',
      images: [],
    },
  });

  const onSubmit = (data: CreateArticleSchemaType) => {
    console.log('Article images:', data.images);
    // Subir imágenes al servidor
  };

  return (
    <>
      <Controller
        control={control}
        name='images'
        render={({ field: { onChange, value } }) => (
          <ImageUploadButton
            multiple={true}
            maxImages={10}
            selectedImages={value || []}
            onImagesSelected={onChange}
            onImageRemovedAt={(index) => {
              const newImages = (value || []).filter((_, i) => i !== index);
              onChange(newImages);
            }}
            disabled={false}
          />
        )}
      />
      {errors.images && (
        <CustomText
          type='error'
          className='mt-1'
        >
          {JSON.parse(errors.images.message || '{}')[locale] ||
            errors.images.message}
        </CustomText>
      )}
    </>
  );
}
```

### Props Modo Múltiple

| Prop               | Tipo                       | Descripción                             |
| ------------------ | -------------------------- | --------------------------------------- |
| `multiple`         | `true`                     | Activa modo múltiple                    |
| `maxImages`        | `number`                   | Límite máximo (default: 10)             |
| `selectedImages`   | `string[]`                 | Array de URIs seleccionadas             |
| `onImagesSelected` | `(uris: string[]) => void` | Callback con array completo             |
| `onImageRemovedAt` | `(index: number) => void`  | Callback para eliminar por índice       |
| `disabled`         | `boolean`                  | Deshabilitar (opcional, default: false) |

---

## 🎨 UI Visual

### Modo Simple

```
┌─────────────────────────────────┐
│  [Preview 96x96]    ❌         │
│                                 │
│      ☁️ Upload Icon             │
│   "Cambiar imagen"             │
└─────────────────────────────────┘
```

### Modo Múltiple

```
┌─────────────────────────────────────┐
│ ◄─ Scroll ─►                       │
│ [1]❌ [2]❌ [3]❌ [4]❌            │
│  80x80  80x80  80x80  80x80        │
│                                     │
│      ☁️ Upload Icon                 │
│  "Agregar más imágenes"            │
│          4 / 10                    │
└─────────────────────────────────────┘
```

---

## 🔧 Integración con React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';

function FormScreen() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      images: [],
    },
  });

  const onSubmit = (data) => {
    console.log('Imágenes:', data.images);
    // Aquí subirías las imágenes al servidor
  };

  return (
    <Controller
      control={control}
      name='images'
      render={({ field: { value, onChange } }) => (
        <ImageUploadButton
          multiple={true}
          maxImages={10}
          selectedImages={value}
          onImagesSelected={onChange}
          onImageRemovedAt={(index) => {
            onChange(value.filter((_, i) => i !== index));
          }}
        />
      )}
    />
  );
}
```

---

## 📝 Schemas de Validación Recomendados

### Schema para Modo Simple (Foto de Perfil)

```typescript
import { z } from 'zod';

export const EditProfileSchema = z.object({
  name: z.string().min(1, {
    message: JSON.stringify({
      en: 'Name is required',
      es: 'El nombre es requerido',
    }),
  }),
  lastName: z.string().min(1, {
    message: JSON.stringify({
      en: 'Last name is required',
      es: 'El apellido es requerido',
    }),
  }),
  profilePicture: z.string().optional(), // ✅ Imagen opcional
});

export type EditProfileSchemaType = z.infer<typeof EditProfileSchema>;
```

### Schema para Modo Múltiple (Artículos/Productos)

```typescript
import { z } from 'zod';

export const CreateArticleSchema = z.object({
  title: z.string().min(1, {
    message: JSON.stringify({
      en: 'Title is required',
      es: 'El título es requerido',
    }),
  }),
  description: z.string().min(10, {
    message: JSON.stringify({
      en: 'Description must be at least 10 characters',
      es: 'La descripción debe tener al menos 10 caracteres',
    }),
  }),
  images: z
    .array(z.string()) // ✅ Array de imágenes
    .min(1, {
      message: JSON.stringify({
        en: 'At least one image is required',
        es: 'Se requiere al menos una imagen',
      }),
    })
    .max(10, {
      message: JSON.stringify({
        en: 'Maximum 10 images allowed',
        es: 'Máximo 10 imágenes permitidas',
      }),
    }),
});

export type CreateArticleSchemaType = z.infer<typeof CreateArticleSchema>;
```

---

## ❓ FAQ

### ¿Las imágenes son opcionales o requeridas?

Depende del schema Zod que definas:

- **Opcional**: `profilePicture: z.string().optional()` - permite 0 imágenes
- **Requerida**: `profilePicture: z.string().min(1, {...})` - requiere al menos 1
- **Múltiples con límites**: `images: z.array(z.string()).min(1).max(10)` - 1-10 imágenes

### ¿Cómo accedo al valor en el formulario?

```tsx
const { watch } = useForm();
const currentImage = watch('profilePicture'); // Modo simple
const currentImages = watch('images'); // Modo múltiple
console.log('Valor actual:', currentImage);
```

### ¿Qué formato tienen las URIs?

```
file:///data/user/0/com.app/cache/ImagePicker/abc123.jpg
```

Son URIs locales. Debes subirlas a tu servidor (Supabase, S3, etc.).

### ¿Cómo subo las imágenes al servidor?

```tsx
const onSubmit = async (data: EditProfileSchemaType) => {
  if (data.profilePicture) {
    // 1. Subir a Supabase Storage
    const { data: uploaded } = await supabase.storage
      .from('profiles')
      .upload(`${userId}/avatar.jpg`, {
        uri: data.profilePicture,
        type: 'image/jpeg',
      });

    // 2. Actualizar con la URL final
    data.profilePictureUrl = uploaded.path;
  }

  // 3. Enviar al backend
  await updateProfile(data);
};
```

### ¿Cómo muestro los errores de validación?

Los errores se muestran automáticamente si incluyes el bloque dentro del Controller:

```tsx
{
  errors.profilePicture && (
    <CustomText
      type='error'
      className='mt-1'
    >
      {JSON.parse(errors.profilePicture.message || '{}')[locale] ||
        errors.profilePicture.message}
    </CustomText>
  );
}
```

---

## 🌍 Traducciones Requeridas

El componente usa estas keys automáticamente:

```json
{
  "screens": {
    "editProfile": {
      "uploadImageButton": "Subir imagen",
      "changeImageText": "Cambiar imagen",
      "addMoreImages": "Agregar más imágenes",
      "imageSelected": "Imagen seleccionada",
      "imagesSelected": "imágenes seleccionadas",
      "supportedFormats": "Formatos soportados: png, jpg, jpeg, webp (Máx 1MB)",
      "permissionRequired": "Permiso Requerido",
      "permissionMessage": "Necesitamos acceso a tu galería...",
      "imageTooLarge": "Imagen muy grande",
      "imageTooLargeMessage": "La imagen será comprimida automáticamente"
    }
  },
  "commonActions": {
    "ok": "OK"
  }
}
```

---

## ⚙️ Configuración requerida

Asegúrate de tener en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos...",
          "cameraPermission": "The app accesses your camera..."
        }
      ]
    ]
  }
}
```

---

## 🎯 Casos de Uso Reales

| Caso             | Modo     | Controller | Schema                | Validación      |
| ---------------- | -------- | ---------- | --------------------- | --------------- |
| Foto de perfil   | Simple   | ✅         | `EditProfileSchema`   | Opcional        |
| Cover photo      | Simple   | ✅         | Custom                | Opcional        |
| Crear artículo   | Múltiple | ✅         | `CreateArticleSchema` | Mín. 1, Máx. 10 |
| Galería producto | Múltiple | ✅         | Custom                | Mín. 3, Máx. 8  |
| Subir documentos | Múltiple | ✅         | Custom                | Opcional        |

---

## 📚 Ejemplos Completos en el Proyecto

- **Modo Simple con Controller**: `app/(tabs)/account/edit-profile.tsx`
- **Schemas**: `src/utils/schemas/index.ts`
- **Componente**: `src/components/ui/ImageUploadButton.tsx`

---
