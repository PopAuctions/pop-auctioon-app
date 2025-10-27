# ImageUploadButton Component

Componente reutilizable para subir imágenes con dos modos: **simple** (una imagen) y **múltiple** (varias imágenes).

## 🎯 Características

- ✅ Modo simple y múltiple
- ✅ Preview con thumbnails
- ✅ Botón X para eliminar imágenes
- ✅ Traducciones automáticas (ES/EN)
- ✅ Validación de tamaño (alerta si > 1MB)
- ✅ Permisos automáticos

---

## 📱 Modo Simple (Una imagen)

**Uso típico:** Foto de perfil, avatar, imagen de portada

```tsx
import { useState } from 'react';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';

function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  return (
    <ImageUploadButton
      selectedImage={profileImage}
      onImageSelected={setProfileImage}
      onImageRemoved={() => setProfileImage(null)}
      disabled={false} // opcional
    />
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

## 📸 Modo Múltiple (Varias imágenes)

**Uso típico:** Galería de artículos, múltiples fotos de productos

```tsx
import { useState } from 'react';
import { ImageUploadButton } from '@/components/ui/ImageUploadButton';

function CreateArticleScreen() {
  const [articleImages, setArticleImages] = useState<string[]>([]);

  const handleRemoveImage = (index: number) => {
    setArticleImages(articleImages.filter((_, i) => i !== index));
  };

  return (
    <ImageUploadButton
      multiple={true}
      maxImages={10}
      selectedImages={articleImages}
      onImagesSelected={setArticleImages}
      onImageRemovedAt={handleRemoveImage}
      disabled={false} // opcional
    />
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

## 📝 Validación con Zod (Opcional)

Si necesitas validar las imágenes:

```typescript
import { z } from 'zod';

// Opcional - permite 0 imágenes
const OptionalImageSchema = z.object({
  profilePicture: z.string().optional(),
});

// Requerida - al menos 1 imagen
const RequiredImageSchema = z.object({
  profilePicture: z.string().min(1, {
    message: JSON.stringify({
      en: 'Profile picture is required',
      es: 'La foto de perfil es requerida',
    }),
  }),
});

// Múltiples - mínimo y máximo
const MultipleImagesSchema = z.object({
  images: z
    .array(z.string())
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
```

---

## ❓ FAQ

### ¿Las imágenes son opcionales?

**Sí**, por defecto puedes tener 0 imágenes. Si quieres hacerlas obligatorias, usa validación Zod o manual.

### ¿Cómo verifico el valor actual?

```tsx
const [image, setImage] = useState<string | null>(null);
console.log('Imagen actual:', image); // file:///path/to/image.jpg
```

### ¿Qué formato tienen las URIs?

```
file:///data/user/0/com.app/cache/ImagePicker/abc123.jpg
```

Son URIs locales. Debes subirlas a tu servidor (Supabase, S3, etc.).

### ¿Cómo subo las imágenes al servidor?

```tsx
const onSubmit = async (data) => {
  if (selectedImage) {
    // Subir a Supabase Storage
    const { data: uploaded } = await supabase.storage
      .from('profiles')
      .upload(`${userId}/avatar.jpg`, {
        uri: selectedImage,
        type: 'image/jpeg',
      });

    data.profilePictureUrl = uploaded.path;
  }

  // Actualizar perfil con URL final
  await updateProfile(data);
};
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

| Caso              | Modo     | Límite | Validación      |
| ----------------- | -------- | ------ | --------------- |
| Foto de perfil    | Simple   | 1      | Opcional        |
| Cover photo       | Simple   | 1      | Opcional        |
| Artículos subasta | Múltiple | 10     | Mín. 1, Máx. 10 |
| Galería producto  | Múltiple | 8      | Mín. 3, Máx. 8  |
| Documentos        | Múltiple | 5      | Opcional        |

---

¿Preguntas? Consulta los ejemplos en `app/(tabs)/account/edit-profile.tsx`
