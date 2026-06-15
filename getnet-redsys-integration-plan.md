# Plan de Integración Getnet/Redsys

> Rama activa: `feature/test-getnet`  
> Modo elegido: **Redirección para cobros** (web + app) + **REST para devoluciones** (solo admin web)

---

## Índice

0. [Estado actual — mapa de archivos por flujo](#0-estado-actual--mapa-de-archivos-por-flujo)
1. [Decisiones de diseño](#1-decisiones-de-diseño)
2. [Flujo completo de cobro](#2-flujo-completo-de-cobro)
3. [Flujo de devolución (web admin)](#3-flujo-de-devolución-web-admin)
4. [Mapeo Stripe → Redsys](#4-mapeo-stripe--redsys)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Archivos a crear — Web (Next.js)](#6-archivos-a-crear--web-nextjs)
7. [Archivos a modificar — Web (Next.js)](#7-archivos-a-modificar--web-nextjs)
8. [Archivos a crear — App (Expo)](#8-archivos-a-crear--app-expo)
9. [Archivos a modificar — App (Expo)](#9-archivos-a-modificar--app-expo)
10. [Base de datos — sin migración](#10-base-de-datos--sin-migración)
11. [Consideraciones técnicas críticas](#11-consideraciones-técnicas-críticas)
12. [Días de trabajo — progreso](#12-días-de-trabajo--progreso)
13. [Estimaciones de tiempo y dificultad](#13-estimaciones-de-tiempo-y-dificultad)

---

## 0. Estado actual — mapa de archivos por flujo

> Esta sección documenta el código **tal como está hoy** antes de cualquier cambio. Úsala como referencia para entender qué toca cada archivo y qué rol juega en los flujos de pago con Stripe.

### Flujo A — Checkout web (subasta, pago múltiple)

```
URL: /[lang]/payment?auctionId=XXX
Redirect on success: /[lang]/payment-success?payment_intent=pi_xxx
```

| Archivo                                                             | Tipo             | Rol actual                                                                                                                                                                                            |
| ------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[lang]/(main)/(protected)/(user)/payment/page.tsx`         | Server Component | Lee `?auctionId`, carga artículos ganados (`getUserWonAuctionArticles`), renderiza `WrapperStripe`                                                                                                    |
| `src/components/payments/wrapper-stripe.tsx`                        | Client Component | Carga `loadStripe`, inicializa `<Elements>` con `mode:'payment'`, calcula totales y pasa props a `CheckoutPage`                                                                                       |
| `src/components/payments/checkout-page.tsx`                         | Client Component | Lógica Stripe: `useStripe()`, `useElements()`, `PaymentElement`. En `useEffect` llama `createPaymentIntent()`. On submit: `elements.submit()` → `createArticlesPayment()` → `stripe.confirmPayment()` |
| `src/lib/payments/payment-intent.ts`                                | Server Action    | Crea `PaymentIntent` en Stripe → devuelve `{ id: pi_xxx, clientSecret }`                                                                                                                              |
| `src/lib/payments/create-articles-payment.ts`                       | Server Action    | Crea registro `UserPayment` en BD con `status=PENDING`, guardando `clientIntent` como `paymentIntent`                                                                                                 |
| `src/lib/payments/reject-articles-payment.ts`                       | Server Action    | Actualiza `UserPayment.status=REJECTED` en BD. Sin llamadas Stripe.                                                                                                                                   |
| `src/app/[lang]/(main)/(protected)/(user)/payment-success/page.tsx` | Server Component | Lee `?payment_intent=pi_xxx`, llama `retrievePaymentInformation()`, muestra status/importe                                                                                                            |
| `src/lib/payments/retrieve-payment-information.ts`                  | Server Action    | Llama `stripe.paymentIntents.retrieve()` + `stripe.charges.retrieve()`. Devuelve `{ paymentIntentObject, chargeObject }`                                                                              |
| `src/lib/payments/process-articles-payment.ts`                      | Server Action    | Actualiza `UserPayment.status=APPROVED`, guarda `chargeId` y `receiptUrl`. Llamado por webhook Stripe.                                                                                                |

### Flujo B — Checkout web (tienda online, artículo individual)

```
URL: /[lang]/single-payment?articleId=XXX
Redirect on success: /[lang]/single-payment-success?payment_intent=pi_xxx
```

| Archivo                                                                    | Tipo             | Rol actual                                                                                                                                                                   |
| -------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[lang]/(main)/(protected)/(user)/single-payment/page.tsx`         | Server Component | Lee `?articleId`, carga datos del artículo (`getArticleSCInfoToBuy`), renderiza `WrapperStripeSingle`                                                                        |
| `src/components/payments/wrapper-stripe-single.tsx`                        | Client Component | Igual que `wrapper-stripe.tsx` pero para un solo artículo. Envuelve `CheckoutPageSingle` en `<Elements>`                                                                     |
| `src/components/payments/checkout-page-single.tsx`                         | Client Component | Igual que `checkout-page.tsx` pero usa `createArticlePayment()`. Redirige a `single-payment-success`                                                                         |
| `src/lib/payments/create-article-payment.ts`                               | Server Action    | Igual que `create-articles-payment.ts` pero para un artículo de tienda                                                                                                       |
| `src/app/[lang]/(main)/(protected)/(user)/single-payment-success/page.tsx` | Server Component | Idéntico a `payment-success/page.tsx`                                                                                                                                        |
| `src/lib/payments/process-single-article-payment.tsx`                      | Server Action    | Similar a `process-articles-payment.ts`. Tiene checks de status Stripe: `processing`, `requires_action`, `requires_payment_method`, `succeeded`. Llamado por webhook Stripe. |

### Flujo C — Webhook Stripe (server-to-server)

```
POST /api/webhooks/stripe
```

| Archivo                                               | Tipo          | Rol actual                                                                                                                                                                                                |
| ----------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/webhooks/stripe/route.ts`                | Route Handler | Verifica firma Stripe (`STRIPE_WEBHOOK_SECRET`), escucha eventos `charge.succeeded` y `payment_intent.payment_failed`. Llama `processArticlesPayment()` o `processSingleArticlePayment()` según metadata. |
| `src/lib/payments/process-articles-payment.ts`        | —             | (ya listado arriba)                                                                                                                                                                                       |
| `src/lib/payments/process-single-article-payment.tsx` | —             | (ya listado arriba)                                                                                                                                                                                       |

### Flujo D — Checkout móvil (app Expo, equivalente al flujo A+B)

```
App → POST /api/mobile/secure/user/payments/create-intent
App → POST /api/mobile/secure/user/payments/create-articles-payment
```

| Archivo                                                                          | Tipo          | Rol actual                                                               |
| -------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| `src/app/api/mobile/secure/user/payments/create-intent/route.ts`                 | Route Handler | Llama `createPaymentIntent()`. Devuelve `{ data: { id, clientSecret } }` |
| `src/app/api/mobile/secure/user/payments/create-articles-payment/route.ts`       | Route Handler | Llama `createArticlesPayment()`. Devuelve `{ data: { userPaymentId } }`  |
| `src/app/api/mobile/secure/user/payments/create-single-article-payment/route.ts` | Route Handler | Llama `createArticlePayment()`. Para artículo individual.                |
| `src/app/api/mobile/secure/user/payments/reject-articles-payment/route.ts`       | Route Handler | Llama `rejectArticlesPayment()`. Sin llamadas Stripe.                    |
| `src/app/api/mobile/secure/user/payments/reject-single-article-payment/route.ts` | Route Handler | Similar al anterior.                                                     |
| `src/app/api/mobile/secure/config/route.ts`                                      | Route Handler | Devuelve config pública al app, incluyendo `STRIPE_PUBLIC_KEY`           |

### Flujo E — Panel del auctioneer (artículos vendidos, SOLO artículos no pagados)

```
URL: /[lang]/sold-article/[id]
```

| Archivo                                                                        | Tipo             | Rol actual                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[lang]/(main)/(protected)/(auctioneer)/sold-article/[id]/page.tsx`    | Server Component | Vista del vendedor. Si el artículo **no está pagado**: muestra botones "Notificar de nuevo", "Enviar a tienda online", "Cancelar adquisición" y "Segundo mejor postor". Si está pagado: muestra resumen de pago + formulario de envío. **No tiene ningún botón de devolución.** |
| `src/lib/payments/cancel-user-acquisition.ts`                                  | Server Action    | **Solo artículos no pagados.** Rechaza con error si `status === PAID`. Borra `UserArticlesWon`, revalida path. Sin Stripe.                                                                                                                                                      |
| `src/lib/payments/cancel-user-acquisition-send-to-online-store.ts`             | Server Action    | Llama RPC Supabase `cancel_article_acquisition_send_to_online_store`. Sin Stripe.                                                                                                                                                                                               |
| `src/app/api/mobile/secure/sold-articles/[id]/cancel-acquisition/route.ts`     | Route Handler    | Equivalente móvil de `cancelUserAcquisition`.                                                                                                                                                                                                                                   |
| `src/app/api/mobile/secure/sold-articles/[id]/change-to-online-store/route.ts` | Route Handler    | Equivalente móvil de `cancelUserAcquisitionSendToOnlineStore`.                                                                                                                                                                                                                  |

### Flujo F — Panel de admin (check-sold-article, solo lectura)

```
URL: /[lang]/check-sold-article/[id]
```

| Archivo                                                                      | Tipo             | Rol actual                                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[lang]/(main)/(protected)/(admin)/check-sold-article/[id]/page.tsx` | Server Component | Vista de admin. Solo lectura: muestra resumen del pago y datos del owner. **No tiene ningún botón de acción/devolución.** El botón de devolución de Fase D se añadirá aquí. |

### Infraestructura compartida

| Archivo                                                    | Descripción                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/app/api/auto/_shared.ts`                              | BullMQ setup: `Queue('auction-queue')` con `ioredis` (env `REDIS_URL`). Prefijo: `'auction-queue-connection'`. |
| `src/middlewares/nonce-middleware.ts`                      | CSP: añade `https://js.stripe.com` + `https://api.stripe.com` para paths `/payment` y `/single-payment`.       |
| `src/lib/supabase/server-admin-no-refresh.ts`              | Export default `supabaseAdmin`. Patrón estándar desde PR #212.                                                 |
| `src/app/api/webhooks/events/route.ts`                     | Webhook Supabase CDC. Auth: `authorization` header = `SUPA_USER_CREATED_SECRET`.                               |
| `src/app/api/webhooks/events/handlers/payment-approved.ts` | Notifica al vendedor cuando `UserPayment.status → APPROVED`.                                                   |

---

---

## 1. Decisiones de diseño

| Aspecto                             | Decisión                                                                         | Motivo                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Modo checkout web                   | **Redirección**                                                                  | Sin PCI-DSS, misma arquitectura que la app                                                                                      |
| Modo checkout app                   | **Redirección** via `expo-web-browser`                                           | Único modo que funciona en React Native sin SDK nativo                                                                          |
| Modo checkout web — Insite          | **Descartado**                                                                   | Widget JS embebido en iframe; no funciona en React Native                                                                       |
| Modo cobros — REST puro             | **Descartado para cobros**                                                       | Requiere manejar datos de tarjeta en servidor → PCI-DSS nivel 1                                                                 |
| Modo devoluciones                   | **REST** solo desde admin web                                                    | Admin solo existe en web; evita añadir endpoints de devolución en la app                                                        |
| DS_MERCHANT_ORDER                   | Timestamp 10dígitos + 2hex random                                                | 12 chars, primeros 4 numéricos (regla Redsys); único; trazable                                                                  |
| Webhook                             | `DS_MERCHANT_MERCHANTURL`                                                        | Señal server-to-server que Redsys envía **antes** de redirigir al usuario                                                       |
| `receiptUrl` en DB                  | `null`                                                                           | Redsys no genera URL de recibo; se puede añadir página interna después                                                          |
| Rollout app móvil                   | **Dual-stack temporal: Stripe legado + Redsys nuevo**                            | Los usuarios de app no actualizan todos al mismo tiempo; el backend debe aceptar ambos flujos durante la transición             |
| Compatibilidad de endpoints móviles | **Añadir endpoints nuevos; no mutar ni borrar los legacy en el cutover inicial** | Los binarios viejos ya salen compilados contra `create-intent`, webhook Stripe y config con `STRIPE_PUBLIC_KEY`                 |
| Retiro de Stripe móvil              | **Por evidencia, no por fecha**                                                  | Solo se desactiva Stripe cuando el tráfico legacy de app haya caído a cero o a un umbral aceptado durante una ventana sostenida |

---

## 2. Flujo completo de cobro

### Fase 1 — App crea sesión de pago

```
App                              Next.js (web API)                    Supabase
 │                                      │                                │
 ├─ POST /user/payments/create-redsys-session ──────────────────────────►│
 │   { amount, selectedItems }           │  valida usuario               │
 │                                      │  genera DS_MERCHANT_ORDER ─────►
 │                                      │  (12 chars: 8 dígitos + 4 hex) │
 │                                      │  firma params HMAC SHA256      │
 │◄─ { sessionToken, launchUrl } ───────┤  guarda token efímero (5 min)  │
```

### Fase 2 — App crea registro en BD (idéntico a Stripe)

```
App                              Next.js (web API)                    Supabase
 │                                      │                                │
 ├─ POST /user/payments/create-articles-payment ─────────────────────────►
 │   { auctionId, articlesIds,           │  valida importes               │
 │     clientTotalAmount,                │  inserta UserPayment           │
 │     clientIntent: DS_MERCHANT_ORDER,  │  status = PENDING ─────────────►
 │     country, userAddressId,           │                                │
 │     discount }                        │                                │
 │◄─ { userPaymentId } ─────────────────┤                                │
```

> `clientIntent` ya no es el `pi_xxx` de Stripe — ahora es el `DS_MERCHANT_ORDER` generado en la fase 1.

### Fase 3 — App abre el navegador

```
App (expo-web-browser)           Next.js bridge page                  Redsys
 │                                      │                                │
 ├─ WebBrowser.openAuthSessionAsync(    │                                │
 │     `{API_BASE_URL}{launchUrl}`,     │                                │
 │     'popauctioonapp://'              │                                │
 │   )                                  │                                │
 │                                      │                                │
 │  GET /api/payments/redsys/launch?token=SESSION_TOKEN                   │
 │                                      │  valida token                  │
 │                                      │  sirve HTML con <form>         │
 │                                      │  JS auto-submit ───────────────►
 │                                      │                    usuario paga│
 │                                      │                    3DS2 si aplica
```

### Fase 4 — Redsys notifica y redirige

```
Redsys                           Next.js webhook                      Supabase
 │                                      │                                │
 ├─ POST /api/webhooks/redsys ──────────►                               │
 │   { Ds_SignatureVersion,             │  decodifica Ds_MerchantParameters
 │     Ds_MerchantParameters,           │  verifica Ds_Signature HMAC    │
 │     Ds_Signature }                   │  Ds_Response 0-99 → OK         │
 │                                      │  llama processArticlesPayment  │
 │                                      │  (DS_MERCHANT_ORDER,           │
 │                                      │   Ds_AuthorisationCode,        │
 │                                      │   null, userId) ───────────────►
 │◄─ HTTP 200 "OK" ─────────────────────┤  UserPayment.status = APPROVED │
 │                                      │                                │
 │  Redirige app: popauctioonapp://payment-result?status=ok&order=ORDER_ID
```

### Fase 5 — App lee el resultado

```
App
 │
 │  result = { type: 'success', url: 'popauctioonapp://payment-result?status=ok&order=...' }
 │  Si status=ok  → toast éxito + navegar a payments-history
 │                  (DB ya actualizada por webhook, no hace falta confirmar)
 │  Si status=ko  → llamar REJECT_ARTICLES_PAYMENT para limpiar registro PENDING
```

> **Nota**: El webhook llega antes o después de que el usuario vuelva a la app.
> Siempre confirmar el estado final con un GET al registro de pago si es necesario.

### Para web (browser nativo)

```
Usuario                          Next.js (server action / route)      Redsys
 │                                      │                                │
 ├─ Click "Pagar" en checkout page ─────►                               │
 │                                      │  genera DS_MERCHANT_ORDER      │
 │                                      │  firma params                  │
 │◄─ renderiza <form> auto-submit ──────┤                                │
 │  browser POST a /sis/realizarPago ───────────────────────────────────►
 │                                      │                    usuario paga│
 │  redirect a /[lang]/payment/success?order=ORDER_ID                    │
 │                                      │  webhook ya procesó el pago    │
```

---

## 3. Flujo de devolución / anulación (web admin)

Solo desde el panel de administración web, sin cambios en la app.

Hay dos tipos de cancelación según cuándo ocurra:

| Tipo       | `TRANSACTIONTYPE` | Cuándo                                                 | `Ds_Response` OK | Mueve dinero          |
| ---------- | ----------------- | ------------------------------------------------------ | ---------------- | --------------------- |
| Anulación  | `9`               | Mismo día del pago, antes del cierre de batch (~23:59) | `400`            | No                    |
| Devolución | `3`               | Cualquier momento (mismo día o posterior)              | `900`            | Sí (1–3 días hábiles) |

### Lógica de decisión — anulación primero, devolución si falla

`create-redsys-refund.ts` decide automáticamente qué tipo usar:

```
Admin web                        Next.js (server action)              Redsys REST
 │                                      │                                │
 ├─ Click "Cancelar/Devolver" ──────────►                               │
 │                                      │  ¿payment.createdAt es hoy?    │
 │                                      │  └─ Sí → intenta TYPE=9 (anulación)
 │                                      │       POST /sis/rest/trataPeticionREST
 │                                      │       { TRANSACTIONTYPE: "9", ... }│
 │                                      │       Ds_Response = "400" → OK ✅
 │                                      │       Si falla (batch ya cerró) │
 │                                      │  └─ No (o falló TYPE=9)         │
 │                                      │       → usa TYPE=3 (devolución) │
 │                                      │       POST /sis/rest/trataPeticionREST
 │                                      │       { TRANSACTIONTYPE: "3", ... }│
 │◄─ resultado ─────────────────────────┤  Ds_Response = "900" → OK ✅   │
 │                                      │  actualiza UserPayment.status  │
```

> **Por qué intentar TYPE=9 primero:** si el admin cancela el mismo día (fraude detectado, error de subasta), la anulación es inmediata para el comprador y no genera comisión. Si Redsys ya cerró el batch, la anulación devuelve error y se cae automáticamente a devolución.

#### Nota importante — estado actual del codebase (revisado)

Tras revisar el código, **ninguno de los archivos de cancelación actuales llama a Stripe**:

- `src/lib/payments/cancel-user-acquisition.ts` — solo borra el registro `UserArticlesWon` de la BD. **Rechaza con error si el artículo ya está `PAID`** (`WonArticleStatus.PAID`). Es decir, esta función SOLO gestiona cancelaciones de adquisiciones no pagadas.
- `src/lib/payments/cancel-user-acquisition-send-to-online-store.ts` — llama a una RPC Supabase (`cancel_article_acquisition_send_to_online_store`). Sin llamadas a Stripe.
- `src/lib/payments/reject-articles-payment.ts` — solo actualiza `UserPayment.status = REJECTED` en BD. Sin llamadas a Stripe.
- **No existe `stripe.refunds.create()` en ningún punto del codebase actual.**

Por tanto, la funcionalidad de devolución de pagos ya realizados (**Fase D**) es una **característica nueva**, no un reemplazo de código Stripe existente. El nuevo archivo `create-redsys-refund.ts` se añadirá como acción de admin para reembolsar pagos `APPROVED`, y `cancel-user-acquisition.ts` se dejará sin cambios (ya que solo maneja adquisiciones no pagadas — no hay cargo que reembolsar).

---

## 4. Mapeo Stripe → Redsys

| Campo Stripe                           | Campo Redsys                                                           | Notas                                                          |
| -------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `clientSecret` (`pi_xxx`)              | `launchUrl` (URL bridge page)                                          | El "secreto" es el token efímero de la URL                     |
| `paymentIntentId` (`pi_xxx`)           | `DS_MERCHANT_ORDER` (12 chars)                                         | 8 dígitos `Date.now()` + 4 hex random; primeros 4 numéricos    |
| `chargeId` (`ch_xxx`)                  | `Ds_AuthorisationCode`                                                 | Código de 6 dígitos devuelto por Redsys                        |
| `receiptUrl` (URL Stripe)              | `null`                                                                 | Generar página interna si se necesita                          |
| `stripe.webhooks.constructEvent()`     | Decodificar `Ds_MerchantParameters` + verificar HMAC SHA256            | Misma seguridad, distinta implementación                       |
| Evento `charge.succeeded`              | `Ds_Response` entre `"000"` y `"099"`                                  | Cualquier valor en ese rango = autorizado                      |
| Evento `payment_intent.payment_failed` | `Ds_Response >= "0100"` o redirect a `urlKO`                           | Redsys redirige a `urlKO`; webhook puede llegar también        |
| `stripe.refunds.create()`              | REST `TRANSACTIONTYPE: "9"` (anulación mismo día) o `"3"` (devolución) | Lógica: intentar anulación primero, caer a devolución si falla |
| `convertToSubcurrency(amount)` × 100   | Igual — `DS_MERCHANT_AMOUNT` en céntimos                               | Sin cambio                                                     |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`        | `REDSYS_MERCHANT_CODE` (env)                                           | Identificador del comercio                                     |
| `STRIPE_SECRET_KEY`                    | `REDSYS_MERCHANT_KEY` (env)                                            | Clave de firma HMAC                                            |
| `STRIPE_WEBHOOK_SECRET`                | `REDSYS_MERCHANT_KEY` (misma)                                          | Se usa para verificar firma del webhook                        |

---

## 5. Variables de entorno

Añadir a `.env.local` y `.env.example`:

```bash
# Getnet / Redsys
REDSYS_MERCHANT_CODE=         # Ej: 999008881 — proporcionado por la entidad bancaria
REDSYS_MERCHANT_KEY=          # Clave secreta Base64 — proporcionada por la entidad bancaria
REDSYS_TERMINAL=1             # Número de terminal (normalmente 1)
REDSYS_ENVIRONMENT=test       # "test" | "prod"
REDSYS_CURRENCY=978           # 978 = EUR

# URLs de retorno web
REDSYS_WEB_URLOK=https://app.popauction.es/{lang}/payment/success
REDSYS_WEB_URLKO=https://app.popauction.es/{lang}/payment/error
REDSYS_MERCHANT_URL=https://app.popauction.es/api/webhooks/redsys

# Deep links app
REDSYS_APP_URLOK=popauctioonapp://payment-result?status=ok
REDSYS_APP_URLKO=popauctioonapp://payment-result?status=ko
```

> `REDSYS_MERCHANT_CODE` es la única variable necesaria para el código de comercio. En cada entorno se configura con el valor que corresponda.

---

## 6. Archivos a crear — Web (Next.js)

### `src/lib/payments/redsys-sign.ts` _(nuevo — utilidad de firma)_

Lógica de firma HMAC SHA256 para Redirección y HMAC SHA512 para REST.

```typescript
// Responsabilidades:
// - generateRedsysOrder(): genera DS_MERCHANT_ORDER único (≤12 chars)
// - buildMerchantParameters(params): JSON → Base64
// - signParams(order, merchantParamsB64, key): HMAC SHA256 (Redirección)
// - signParamsRest(order, merchantParamsB64, key): HMAC SHA512 (REST)
// - verifyWebhookSignature(params, signature, key): valida firma del webhook
// - decodeWebhookParams(b64): decodifica Ds_MerchantParameters del webhook
```

### `src/lib/payments/create-redsys-session.ts` _(nuevo — equivalente a createPaymentIntent)_

Server action que genera los parámetros firmados y un token de sesión efímero.

```typescript
// Input:  amount (número), selectedItems (number[]), platform: 'web' | 'app', lang: string
// Output: { sessionToken, launchUrl, redsysOrder }
// Guarda en `RedsysSessions` vía Supabase service role:
// { token, redsysOrder, signedParams, userId, lang, expiresAt, used }
```

### `src/app/api/payments/redsys/launch/route.ts` _(nuevo — bridge page)_

Route handler GET que sirve una página HTML con el formulario auto-submit a Redsys.

```typescript
// GET /api/payments/redsys/launch?token=SESSION_TOKEN
// 1. Valida el token (TTL 5 min)
// 2. Recupera los params firmados del token
// 3. Devuelve HTML con:
//    <form action="https://sis[-t].redsys.es/sis/realizarPago" method="POST">
//      <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1">
//      <input type="hidden" name="Ds_MerchantParameters" value="...">
//      <input type="hidden" name="Ds_Signature" value="...">
//    </form>
//    <script>document.forms[0].submit();</script>
```

### `src/app/api/mobile/secure/user/payments/create-redsys-session/route.ts` _(nuevo — endpoint móvil)_

Equivalente móvil de `create-intent/route.ts`. Llama a `createRedsysSession('app', ...)`.

```typescript
// POST — misma validación que create-intent
// Respuesta: { error: null, data: { sessionToken, launchUrl, redsysOrder } }
```

### `src/app/api/webhooks/redsys/route.ts` _(nuevo — webhook Redsys)_

Equivalente exacto de `src/app/api/webhooks/stripe/route.ts`.

```typescript
// POST (enviado por Redsys server-to-server)
// 1. Lee body: { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature }
// 2. Decodifica Ds_MerchantParameters (Base64 → JSON)
// 3. Verifica Ds_Signature con REDSYS_MERCHANT_KEY
// 4. Si Ds_Response entre "000" y "099":
//      llama processArticlesPayment(
//        Ds_Order,            // = paymentIntent en UserPayment
//        Ds_AuthorisationCode,
//        null,                // receiptUrl (Redsys no genera una)
//        Ds_MerchantData      // userId guardado como metadata
//      )
// 5. Responde HTTP 200 "OK" (Redsys reintenta si recibe otro código)
```

### `src/lib/payments/create-redsys-refund.ts` _(nuevo — anulación + devolución via REST)_

Server action para el panel de admin. Decide automáticamente entre anulación (`TYPE=9`) y devolución (`TYPE=3`).

```typescript
// Input:  redsysOrder (DS_MERCHANT_ORDER original), amount (en céntimos), createdAt (Date)
// Output: ActionResponse & { type: 'anulacion' | 'devolucion' }
//
// Lógica:
//   1. Si createdAt es hoy → intenta TYPE=9 (anulación)
//      Ds_Response=400 → éxito, devuelve type='anulacion'
//      Cualquier otro error → cae a paso 2
//   2. TYPE=3 (devolución)
//      Ds_Response=900 → éxito, devuelve type='devolucion'
//
// No maneja datos de tarjeta → sin impacto PCI-DSS
```

### `src/app/[lang]/(main)/(protected)/(user)/payment/success/page.tsx` _(nuevo — página retorno web)_

Página que muestra el usuario cuando Redsys redirige a `DS_MERCHANT_URLOK`.

### `src/app/[lang]/(main)/(protected)/(user)/payment/error/page.tsx` _(nuevo — página retorno web)_

Página de error cuando Redsys redirige a `DS_MERCHANT_URLKO`.

---

## 7. Archivos a modificar — Web (Next.js)

### `src/lib/payments/process-articles-payment.ts`

- Parámetro `chargeId` (actualmente obligatorio `string`) → hacerlo opcional o `string | null`
- Parámetro `receiptUrl` ya es `string | null`, sin cambio
- Sin cambios en lógica de negocio — `paymentIntentId` ahora será el `DS_MERCHANT_ORDER`

### `src/lib/payments/create-articles-payment.ts` _(limpieza de PENDING huérfanos)_

Añadir justo **antes del `INSERT` de `UserPayment`** la cancelación de cualquier registro `PENDING` previo del mismo usuario para la misma subasta. Esto cubre el caso en que el usuario llega a Redsys, no paga (3DS abandonado, cierre de tab, error de red) y vuelve a intentarlo más tarde: el registro PENDING antiguo se marca como `REJECTED` automáticamente y solo queda activo el nuevo.

```typescript
// Rechazar UserPayments PENDING anteriores para este usuario/subasta
await supabase
  .from('UserPayment')
  .update({ status: UserPaymentStatus.REJECTED })
  .eq('userId', currentUserId)
  .eq('auctionId', auctionId)
  .eq('status', UserPaymentStatus.PENDING);
```

> Si no hay registros PENDING previos el `UPDATE` afecta 0 filas — sin efecto secundario.

### `src/lib/payments/create-article-payment.ts` _(limpieza de PENDING huérfanos)_

Igual que `create-articles-payment.ts` pero filtrando por `articleId` (columna `articlesPaid` contiene el array con el artículo). Como `articlesPaid` es un array en BD, el filtro más fiable es por `userId` + `auctionId IS NULL` + `status=PENDING` y comparando que el array contenga el artículo:

```typescript
// Rechazar UserPayments PENDING anteriores para este usuario/artículo de tienda
await supabase
  .from('UserPayment')
  .update({ status: UserPaymentStatus.REJECTED })
  .eq('userId', currentUserId)
  .is('auctionId', null)
  .eq('status', UserPaymentStatus.PENDING)
  .contains('articlesPaid', [articleId]);
```

> Garantiza que solo haya **un `UserPayment` PENDING activo** por usuario en cualquier momento.

### `src/lib/payments/process-single-article-payment.tsx` _(⚠️ CÓDIGO MUERTO — borrar)_

- **Tras revisar el codebase, esta función no es invocada desde ningún sitio** (`grep -r processSingleArticlesPayment src/` solo encuentra su propia definición).
- El webhook de Stripe (`/api/webhooks/stripe/route.ts`) llama únicamente a `processArticlesPayment()` — que ya soporta ambos flujos (subasta y artículo individual) mediante el branch `if (userPayment.auctionId) processMultipleArticles() else processSingleArticle()`.
- `create-article-payment.ts` (single) inserta `UserPayment` **sin `auctionId`** (queda `null`), por lo que automáticamente cae en el branch `processSingleArticle` cuando llega el webhook.
- **Acción**: borrar este archivo en la limpieza final (Día 9). No requiere refactor.

### `src/lib/payments/retrieve-payment-information.ts` _(⚠️ faltaba en el plan)_

- Llama a Stripe para recuperar `PaymentIntent` + `Charge`. Usada por `payment-success/page.tsx` y `single-payment-success/page.tsx` para mostrar el importe y estado al usuario.
- Para Redsys: estas páginas leerán el `UserPayment` directamente de la BD con el `DS_MERCHANT_ORDER` del query param `?order=`.
- Esta función quedará **sin uso** una vez migradas ambas páginas de éxito.

### `src/app/[lang]/(main)/(protected)/(user)/payment-success/page.tsx` _(⚠️ faltaba en el plan)_

- Actualmente llama a `retrievePaymentInformation(paymentIntent)` para mostrar importes.
- Para Redsys: leer `UserPayment` de BD con `?order=DS_MERCHANT_ORDER` en lugar de `?payment_intent=`.
- Los mapas `statusMap`/`iconMap` por estado Stripe desaparecen; la página solo muestra éxito (el webhook ya procesó antes de redirigir).

### `src/app/[lang]/(main)/(protected)/(user)/single-payment-success/page.tsx` _(⚠️ faltaba en el plan)_

- Mismos cambios que `payment-success/page.tsx`.

### `src/app/api/mobile/secure/user/payments/reject-articles-payment/route.ts`

- **Sin cambios requeridos**: ya no llama a Stripe (solo actualiza estado en BD). Compatible con Redsys tal como está.

### `src/app/api/mobile/secure/user/payments/reject-single-article-payment/route.ts`

- **Sin cambios requeridos**: igual que el anterior.

### `src/app/api/mobile/secure/config/route.ts`

- Añadir `REDSYS_MERCHANT_CODE` a la respuesta junto a (o en lugar de) `STRIPE_PUBLIC_KEY`
- La app necesita saber el merchant code si en algún momento hace validación client-side

### `src/middlewares/nonce-middleware.ts` (CSP)

Añadir dominios de Redsys a la Content Security Policy:

```
connect-src: https://sis.redsys.es https://sis-t.redsys.es:25443
form-action: https://sis.redsys.es https://sis-t.redsys.es:25443
```

### `src/lib/payments/cancel-user-acquisition.ts`

- **Sin cambios para Redsys** — este archivo SOLO maneja cancelaciones de adquisiciones **no pagadas** (devuelve error si `status === PAID`). No hay cargo que reembolsar.
- La funcionalidad de reembolso de pagos ya realizados se implementa en el nuevo `create-redsys-refund.ts` (Fase D), accesible desde un botón de admin separado en artículos con `status === PAID`.

### `.env.example`

Añadir las variables del apartado 5.

---

## 8. Archivos a crear — App (Expo)

### `src/hooks/payment/useRedsysPayment.ts` _(nuevo — reemplaza useStripePayment en el release nuevo, sin obligar a borrar el legado todavía)_

Misma interfaz pública que `useStripePayment`, compatible drop-in:

```typescript
interface UseRedsysPaymentReturn {
  initializePaymentSession: (
    amount: number,
    selectedItems: number[]
  ) => Promise<string | null>;
  // Devuelve redsysOrder si éxito, null si falla
  // (equivale a initializePaymentSheet)

  openPaymentBrowser: () => Promise<{
    success: boolean;
    error?: { code: string; message: string };
  }>;
  // Abre expo-web-browser con la launchUrl
  // Detecta redirect a popauctioonapp://payment-result
  // (equivale a presentPaymentSheet)

  isLoading: boolean;
  status: RequestStatus;
  errorMessage: LangMap | null;
  clearError: () => void;
  redsysOrderId: string | null; // equivale a paymentIntentId
}
```

Internamente usa:

- `WebBrowser.openAuthSessionAsync(launchUrl, 'popauctioonapp://')` de `expo-web-browser`
- Parsea la URL de retorno para extraer `status` y `order`

---

## 9. Archivos a modificar — App (Expo)

### `src/config/api-config.ts`

Añadir en `SECURE_ENDPOINTS.PAYMENT`:

```typescript
PAYMENT: {
  CREATE_INTENT: '/user/payments/create-intent', // LEGACY app: no borrar en el primer release
  CREATE_REDSYS_SESSION: '/user/payments/create-redsys-session', // NUEVO app: Redsys
  REJECT_ARTICLES_PAYMENT: '/user/payments/reject-articles-payment', // ya existe, sin cambio
}
```

### Compatibilidad de rollout móvil (crítico)

El checkout web sí puede hacer cutover completo. **La app no**: cuando publiquemos Redsys, seguirán existiendo builds instalados que todavía intentarán pagar con Stripe hasta que el usuario actualice.

Por tanto, el plan correcto para móvil es este:

- **App legacy (sin update)** sigue usando su contrato actual: `create-intent` + Stripe SDK/app flow + `/api/webhooks/stripe`.
- **App nueva** usa `create-redsys-session` + redirección Redsys.
- **Endpoints compartidos y agnósticos al gateway** (`create-articles-payment`, `create-single-article-payment`, reject routes) se mantienen para ambos flujos.
- **No reutilizar `create-intent` para Redsys** ni cambiar su payload/respuesta; eso rompería clientes ya publicados.
- **No eliminar `STRIPE_PUBLIC_KEY` de `/api/mobile/secure/config`** mientras siga existiendo soporte legacy.

Tabla de convivencia recomendada:

| Cliente móvil | Inicio de pago                                                | Backend que debe seguir vivo                                                      |
| ------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| App vieja     | `POST /api/mobile/secure/user/payments/create-intent`         | `payment-intent.ts`, `/api/webhooks/stripe`, `STRIPE_PUBLIC_KEY` en config        |
| App nueva     | `POST /api/mobile/secure/user/payments/create-redsys-session` | `create-redsys-session.ts`, `/api/payments/redsys/launch`, `/api/webhooks/redsys` |

### `src/app/api/mobile/secure/config/route.ts`

Durante la transición debe exponer **ambos mundos**:

- Mantener `STRIPE_PUBLIC_KEY` para builds viejos.
- Mantener el envelope actual de respuesta del endpoint:
  `{ success, config, user, level, timestamp }`
- Añadir flags explícitas para el rollout nuevo, por ejemplo:

```typescript
{
  success: true,
  config: {
    STRIPE_PUBLIC_KEY: 'pk_live_...',
    payments: {
      mobileDefaultGateway: 'redsys',
      legacyStripeEnabled: true,
    },
  },
}
```

La app nueva puede ignorar Stripe y usar Redsys directo, o leer este flag como kill switch. Lo importante para este plan es que el backend no deje huérfanos a los clientes viejos.

### `app/(tabs)/account/payment.tsx`

Cambios mínimos en el **release nuevo** — solo reemplazar el hook:

```diff
- import { useStripePayment } from '@/hooks/payment/useStripePayment';
+ import { useRedsysPayment } from '@/hooks/payment/useRedsysPayment';

  // En el componente:
- const { initializePaymentSheet, presentPaymentSheet, isLoading: paymentLoading } = useStripePayment();
+ const { initializePaymentSession, openPaymentBrowser, isLoading: paymentLoading } = useRedsysPayment();

  // En handlePayment, Paso 1:
- const paymentIntentId = await initializePaymentSheet(paymentDetails.total, selectedArticleIds);
+ const redsysOrderId = await initializePaymentSession(paymentDetails.total, selectedArticleIds);

  // Paso 3 — presentar:
- const { success, error: presentError } = await presentPaymentSheet();
+ const { success, error: presentError } = await openPaymentBrowser();
```

El campo `clientIntent` que se pasa a `createPayment` será el `redsysOrderId` en lugar del `paymentIntentId`.

### `app/(tabs)/account/single-payment.tsx`

Mismos cambios exactos que `payment.tsx` para el release nuevo.

### `src/hooks/pages/payment/useArticlesPayment.ts`

Sin cambios — ya usa `clientIntent` como string genérico; el valor simplemente cambia de `pi_xxx` a `DS_MERCHANT_ORDER`.

---

## 10. Base de datos

### Tabla `UserPayment` — sin cambios de esquema

Los mismos campos de `UserPayment` almacenan los valores nuevos:

| Campo DB        | Valor Stripe (actual)                 | Valor Redsys (nuevo)                            |
| --------------- | ------------------------------------- | ----------------------------------------------- |
| `paymentIntent` | `pi_3PxxxxxSTRIPE`                    | `17162345ABCD` (12 chars, primeros 4 numéricos) |
| `chargeId`      | `ch_3PxxxxxSTRIPE`                    | `123456` (Ds_AuthorisationCode)                 |
| `receiptUrl`    | `https://pay.stripe.com/receipts/...` | `null`                                          |
| `status`        | `PENDING` / `APPROVED` / `REJECTED`   | Sin cambio                                      |
| `articlesPaid`  | `[1, 2, 3]`                           | Sin cambio                                      |

### Tabla `RedsysSessions` — nueva migración

Almacén distribuido para los tokens efímeros de sesión Redsys. **Reemplaza el `Map` en memoria de `redsys-token-store.ts`**, que fallaba en producción serverless porque cada instancia de Vercel tiene su propio proceso Node.js (ver §11 → Token store en producción).

**Migración aplicada en Dev:** crear/renombrar `RedsysSessions`

```sql
CREATE TABLE "RedsysSessions" (
  token TEXT PRIMARY KEY,
  redsys_order TEXT NOT NULL,
  signed_params JSONB NOT NULL,
  user_id UUID NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('en', 'es')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index to speed up cleanup of expired rows
CREATE INDEX "RedsysSessions_expires_at_idx" ON "RedsysSessions" (expires_at);

-- No direct user access: only service role (bypasses RLS) can read/write
ALTER TABLE "RedsysSessions" ENABLE ROW LEVEL SECURITY;
```

**Acceso**: sólo vía `supabaseAdmin` (service role key, bypasses RLS). Nunca se expone al cliente.

> **Estado real del repo**: `src/types/supabase.ts` ya refleja la tabla `RedsysSessions`, así que en la **DB de dev sí existe**. Pero en este repo no aparece un archivo SQL/migración versionado para crearla/renombrarla. Antes de depender de esto para más entornos o para reproducibilidad, hay que commitear la migración real.

**Garantía de single-use**: `consumeSessionToken` usa un `UPDATE ... WHERE used = false AND expires_at > now() RETURNING *`. La atomicidad de Postgres garantiza que sólo una instancia puede consumir el token, aunque dos instancias lleguen simultáneamente.

**Limpieza**: `createSessionToken` hace un `DELETE` best-effort de las filas expiradas antes de insertar, igual que el `pruneExpired()` anterior.

---

## 11. Consideraciones técnicas críticas

### DS_MERCHANT_ORDER — formato estricto

Manual Redsys (Redirección V3.0 §5.1 / REST V4.0.1 §3.3):

- Longitud **4–12 caracteres**
- **Los 4 primeros caracteres deben ser numéricos** (crítico — si no, Redsys responde `SIS0042` y rechaza el pago)
- Los 8 restantes pueden ser alfanuméricos ASCII (sin caracteres especiales)
- Único por comercio en un periodo razonable

### Nombres de campos — PascalCase obligatorio

Redsys es **case-sensitive** con los nombres de campos dentro de `Ds_MerchantParameters`. Hay que usar exactamente la convención PascalCase:

```
Ds_Merchant_Amount, Ds_Merchant_Order, Ds_Merchant_MerchantCode,
Ds_Merchant_Currency, Ds_Merchant_TransactionType, Ds_Merchant_Terminal,
Ds_Merchant_MerchantURL, Ds_Merchant_UrlOK, Ds_Merchant_UrlKO,
Ds_Merchant_ProductDescription, Ds_Merchant_ConsumerLanguage,
Ds_Merchant_MerchantData
```

Si se envían en `ALL_CAPS` (`DS_MERCHANT_AMOUNT`), Redsys los **ignora silenciosamente** → la pantalla de pago muestra importe 0,00 € y número de pedido vacío, y termina en error técnico **SIS0042**. Verificado en pruebas.

### Claves de firma Getnet — son DOS distintas

Getnet (a diferencia de algunos comercios Redsys) entrega **dos claves diferentes** en el portal de admin:

- **SHA-256** (32 chars Base64) → `REDSYS_MERCHANT_KEY` → Redirección y verificación de webhook
- **SHA-512** (16 chars Base64) → `REDSYS_MERCHANT_KEY_REST` → REST API (reembolsos, Día 8)

Ambas son válidas y completas. No confundir longitud con truncado.

Generar con:

```typescript
import * as crypto from 'crypto';

function generateRedsysOrder(): string {
  const ts = Date.now().toString().slice(-8); // 8 dígitos decimales
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 hex
  return `${ts}${rand}`; // 12 chars, primeros 4 numéricos ✅
}
```

El sufijo aleatorio de 16 bits (65 536 valores por ms) hace que las colisiones sean imposibles en la práctica incluso bajo ráfagas. Validado con tests en `scripts/test-redsys-sign.mjs`.

> ⚠️ El intento inicial de prefijar con `PA...` era INVÁLIDO: las letras al inicio violan la regla de "4 primeros numéricos".

### Firma HMAC SHA256 (Redirección) — algoritmo exacto

```
1. Codificar params JSON en Base64 → Ds_MerchantParameters
2. Derivar clave (idem SDK PHP oficial `redsysHMAC256_API.php`):
   - Cipher: 3DES (DES-EDE3-CBC)
   - Key: REDSYS_MERCHANT_KEY decodificada de Base64 (24 bytes para SHA-256)
   - IV: 8 bytes de CEROS — NO el order
   - Plaintext: el DS_MERCHANT_ORDER en UTF-8, zero-padded a múltiplo de 8
   - Output: ciphertext = clave HMAC derivada
3. HMAC-SHA256(claveDerivada, Ds_MerchantParameters_base64) → Ds_Signature (Base64)
```

> ⚠️ Errores comunes (todos terminan en SIS0042 con importe 0 € y order vacío en la pantalla de Redsys):
>
> - Usar AES en lugar de 3DES
> - Usar el order como IV (en lugar de IV de ceros)
> - Encriptar la clave en lugar del order
> - No hacer zero-padding del order a 8/16 bytes
>
> El test `scripts/test-redsys-sign.mjs` incluye un golden vector que detecta cualquiera de estos errores.

### Token efímero de sesión

- TTL: 5 minutos
- Almacenamiento real actual: tabla `RedsysSessions` en Supabase, consumida con `supabaseAdmin`
- El token contiene: `{ redsysOrder, signedParams: { Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature }, userId, lang, expiresAt }`
- Se invalida al usarse (single-use) mediante `UPDATE ... WHERE used = false ... RETURNING *`

### Verificación del webhook

```
1. Decodificar Ds_MerchantParameters: Buffer.from(b64, 'base64').toString('utf-8') → JSON
2. Extraer Ds_Order del JSON
3. Derivar clave 3DES con Ds_Order (mismo algoritmo que firma de Redirección)
4. HMAC-SHA256(clave, Ds_MerchantParameters) → firma esperada
5. Comparar con Ds_Signature usando crypto.timingSafeEqual()
```

### Deep link en app — scheme ya configurado

`app.json` ya tiene `"scheme": "popauctioonapp"` y `"expo-web-browser"` en plugins. No requiere cambios.

`DS_MERCHANT_URLOK` para app: `popauctioonapp://payment-result?status=ok&order=ORDER_ID`

### Endpoints de Redsys

| Entorno    | Redirección                                      | REST                                                       |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------- |
| Test       | `https://sis-t.redsys.es:25443/sis/realizarPago` | `https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST` |
| Producción | `https://sis.redsys.es/sis/realizarPago`         | `https://sis.redsys.es/sis/rest/trataPeticionREST`         |

### Cadena de notificaciones push — Redsys webhook → Supabase CDC → seller

Cuando el webhook Redsys (`/api/webhooks/redsys`) actualiza `UserPayment.status = APPROVED` en la BD, **Supabase dispara automáticamente** el webhook de eventos (`/api/webhooks/events`) a través del mecanismo CDC (Change Data Capture):

```
Redsys webhook
  → llama processArticlesPayment()
  → UPDATE UserPayment SET status = 'APPROVED'
  → Supabase CDC detecta el cambio
  → POST /api/webhooks/events
  → classifySupabaseEvent() → NotificationEventType.PAYMENT_APPROVED
  → handlePaymentApproved()
  → sendPushNotification() al vendedor (ownerId)
```

**Implicación**: el webhook de Redsys **no necesita enviar push notifications directamente**. La cadena Supabase CDC → `/api/webhooks/events` ya lo hace. Auth del webhook de eventos: `authorization` header = `SUPA_USER_CREATED_SECRET`.

Archivos relevantes ya existentes (no requieren cambios):

- `src/app/api/webhooks/events/route.ts` — handler modular de eventos Supabase
- `src/app/api/webhooks/events/handlers/payment-approved.ts` — notifica al vendedor con soporte multiidioma (`User.language`)
- `src/lib/push-notifications/get-user-language.ts` — lee `User.language` para personalizar idioma

### supabaseAdmin — patrón estándar desde PR #212

A partir del PR #212 el cliente de Supabase server-side es `supabaseAdmin` (importado desde `@/lib/supabase/server-admin-no-refresh`). **Todos los archivos nuevos deben usar este patrón** en lugar de `createSupabaseServerClientNoRefresh()`.

```typescript
import supabaseAdmin from '@/lib/supabase/server-admin-no-refresh';
// Uso directo:
const { data } = await supabaseAdmin.from('UserPayment').select('...');
```

### Compatibilidad con escritura en BD y notificaciones (verificado a fondo)

Revisión completa de la cadena escritura BD → notificación tras introducir Redsys. **Todo el flujo posterior al webhook permanece intacto** porque el contrato entre `processArticlesPayment()` y la BD no cambia.

#### Tabla de compatibilidad por componente

| Componente                                   | ¿Toca Redsys?                                            | ¿Cambia su escritura en BD?                                                                                                                                                               | ¿Afecta notificaciones?                                                                       |
| -------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `create-articles-payment.ts`                 | No — sigue insertando `UserPayment` con `status=PENDING` | `paymentIntent` ahora contiene `17162345ABCD` en lugar de `pi_xxx` (mismo tipo `text`)                                                                                                    | No — el insert PENDING no dispara push                                                        |
| `create-article-payment.ts`                  | No — inserta `UserPayment` con `auctionId=null`          | Igual que arriba                                                                                                                                                                          | No                                                                                            |
| `processArticlesPayment()`                   | Sí — invocado por webhook Redsys                         | UPDATE `status=APPROVED`, `chargeId=Ds_AuthorisationCode`, `receiptUrl=null`. Mismas escrituras downstream (`UserArticlesWon`, `ArticleSecondChance`, `Article.sold`, `UserDiscountCode`) | Dispara CDC → push automático ✅                                                              |
| `processSingleArticle` (helper interno)      | Indirecto vía `processArticlesPayment`                   | Sin cambio                                                                                                                                                                                | Sin cambio                                                                                    |
| `processMultipleArticles` (helper interno)   | Indirecto                                                | Sin cambio                                                                                                                                                                                | Sin cambio                                                                                    |
| `process-single-article-payment.tsx`         | N/A — código muerto, se borra                            | —                                                                                                                                                                                         | —                                                                                             |
| Supabase CDC → `/api/webhooks/events`        | Indirecto                                                | Sin cambio                                                                                                                                                                                | Sin cambio — se dispara automáticamente                                                       |
| `handlePaymentApproved()`                    | No                                                       | Solo lee `UserArticlesWon` y envía push                                                                                                                                                   | **Sigue funcionando idéntico** — depende únicamente de `status === APPROVED` y `articlesPaid` |
| `payment-approved.ts` envía a buyer + seller | No                                                       | INSERT en `Notification` (vía `createNotification`)                                                                                                                                       | Misma lógica multi-idioma                                                                     |

#### Diagrama: cadena completa post-webhook (web y app por igual)

```
Redsys webhook POST /api/webhooks/redsys
  └─ verifyWebhookSignature() OK
  └─ Ds_Response entre 000–099
  └─ processArticlesPayment(Ds_Order, Ds_AuthorisationCode, null, userId)
       ├─ SELECT UserPayment WHERE paymentIntent = Ds_Order  (status=PENDING)
       ├─ UPDATE UserPayment SET status='APPROVED', chargeId, receiptUrl=null
       │    └─ 🔔 Supabase CDC dispara webhook a /api/webhooks/events
       │         └─ classifySupabaseEvent() → PAYMENT_APPROVED
       │         └─ handlePaymentApproved():
       │              ├─ sendPushNotification(seller, PAYMENT_RECEIVED)
       │              ├─ sendPushNotification(buyer,  PAYMENT_APPROVED)
       │              ├─ createNotification(seller, PAYMENT_RECEIVED)
       │              └─ createNotification(buyer,  PAYMENT_APPROVED)
       │
       ├─ if (userPayment.auctionId) → processMultipleArticles
       │    └─ UPDATE UserArticlesWon SET status='PAID', userPaymentId
       │         └─ (CDC dispara ARTICLE_WON solo en INSERT, no en UPDATE — sin push extra) ✅
       │
       └─ else (single article)  → processSingleArticle
            ├─ UPDATE ArticleSecondChance SET status='SOLD'
            ├─ UPDATE Article SET sold=true, soldPrice
            ├─ INSERT UserArticlesWon (status=PAID, ownerId=articleSC.userId)
            │    └─ ⚠️ CDC dispara ARTICLE_WON (INSERT) → push al buyer
            │         (comportamiento idéntico al actual con Stripe)
            └─ DELETE ArticleOffer (limpieza ofertas no aceptadas)
```

#### De dónde sale `userId` en el webhook (importante)

Stripe lo pasa vía `objectDataCharge.metadata.userId`. Redsys ofrece **dos opciones**:

| Opción                             | Cómo                                                                               | Ventaja                                                          | Desventaja                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| **A — `Ds_Merchant_MerchantData`** | Pasar `JSON.stringify({ userId })` en el campo de metadata Redsys (máx 200 chars)  | Idéntico al patrón Stripe                                        | Round-trip; si Redsys lo trunca o codifica mal, se pierde |
| **B — Lookup en BD (recomendado)** | `SELECT userId FROM UserPayment WHERE paymentIntent = Ds_Order` dentro del webhook | Más seguro; el `userId` está atado al registro PENDING ya creado | Una query extra                                           |

**Decisión adoptada**: usar opción **B**. El webhook hace primero el lookup del `UserPayment` por `Ds_Order`, extrae el `userId`, y luego llama `processArticlesPayment()`. Esto también permite validar que el order pertenece a un pago PENDING legítimo antes de procesar.

#### Query param de las páginas de éxito (cambio obligatorio)

Stripe redirige con `?payment_intent=pi_xxx` (lo añade automáticamente al `return_url`). Redsys **no añade params automáticamente**, hay que incluirlos manualmente en `DS_MERCHANT_URLOK`:

```
DS_MERCHANT_URLOK = `${REDSYS_WEB_URLOK}?order=${redsysOrder}`
```

Las páginas `payment-success/page.tsx` y `single-payment-success/page.tsx` deben:

1. Cambiar `searchParams.payment_intent` → `searchParams.order`
2. Reemplazar `retrievePaymentInformation()` (que llama Stripe API) por una query directa a BD:
   ```typescript
   const { data: userPayment } = await supabaseAdmin
     .from('UserPayment')
     .select('id, status, totalAmount, chargeId, articlesPaid, auctionId')
     .eq('paymentIntent', order)
     .single();
   ```
3. Mostrar UI según `userPayment.status`:
   - `APPROVED` → pantalla de éxito
   - `PENDING` → "procesando…" (el webhook puede haber tardado; la página puede revalidar cada 2 s)
   - `REJECTED` o no encontrado → pantalla de error

#### Deep link app — caso borde

Redsys permite cualquier URL en `URLOK/URLKO`, incluyendo schemes custom como `popauctioonapp://`. `expo-web-browser` con `openAuthSessionAsync(launchUrl, 'popauctioonapp://')` detecta esa redirección y cierra el browser.

**Riesgo conocido**: algunos navegadores in-app no honran redirects a schemes no-HTTP. **Mitigación opcional**: en lugar de redirigir directamente al scheme, construir un endpoint web intermedio:

```
DS_MERCHANT_URLOK_APP = `${API_BASE}/api/payments/redsys/app-return?status=ok&order=${order}`
```

Que devuelva HTML con `<meta http-equiv="refresh" content="0;url=popauctioonapp://payment-result?...">` + JS fallback. **No se implementa de inicio**; si falla en testing real con la app, añadir como Día 7.5.

#### Resumen — qué garantiza el plan

- ✅ Mismas escrituras en `UserPayment`, `UserArticlesWon`, `ArticleSecondChance`, `Article`, `UserDiscountCode`
- ✅ Cadena Supabase CDC → `/api/webhooks/events` → push notifications **intacta**
- ✅ Tanto buyer como seller siguen recibiendo push y entrada en `Notification`
- ✅ Mismo flujo para web y app (ambos usan el mismo webhook y el mismo `processArticlesPayment`)
- ✅ Flujo single-article (online store) sigue funcionando porque `auctionId=null` lo enruta al branch correcto

---

### Autorización síncrona — no hay "card said yes, bank said no later"Redsys autoriza de forma **síncrona**. Cuando el webhook recibe `Ds_Response=000`, el banco ya confirmó el cargo definitivamente. No existe el patrón de Stripe donde `charge.succeeded` podía ser seguido días después por un dispute.

| Escenario                                                | Lo que hace Redsys                                              |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| Tarjeta denegada / CVC incorrecto / fondos insuficientes | `Ds_Response >= 0100` en el mismo acto → webhook con ese código |
| 3DS2 — usuario autentica bien                            | Flujo normal → `Ds_Response=000`                                |
| 3DS2 — usuario no autentica                              | `Ds_Response=184`                                               |
| Banco no disponible                                      | `Ds_Response=912` o `9912`                                      |
| Usuario cierra browser **antes** de pagar                | Sin webhook, sin redirect → `UserPayment` queda PENDING         |
| Contracargo posterior                                    | **NO llega por webhook** — gestión manual en portal Getnet      |

### Pagos huérfanos (PENDING sin cerrar) — job de limpieza requerido

Si el usuario cierra el in-app browser o el tab web antes de pagar:

- El banco nunca procesó nada → no llega webhook ni redirect a URLOK/KO
- El `UserPayment` queda `PENDING` indefinidamente

**Solución**: job de BullMQ (ya existe en el proyecto) que se ejecute cada hora y llame `rejectArticlesPayment()` sobre registros `PENDING` con más de 2 horas de antigüedad.

```typescript
// Lógica del job
const stalePayments = await supabase
  .from('UserPayment')
  .select('id, userId, articlesPaid, discountCode')
  .eq('status', 'PENDING')
  .lt('createdAt', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

// Para cada uno: rejectArticlesPayment(payment.id)
```

### Timeout del webhook

Redsys espera `HTTP 200` en la respuesta del webhook. Si no recibe respuesta en ~30 segundos, reintenta. Devolver siempre `200` aunque el procesamiento interno falle (loguear el error internamente).

### Códigos de respuesta Redsys

| Rango         | Significado                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `000` – `099` | Autorizado ✅                                                                                 |
| `900`         | Devolución OK ✅                                                                              |
| `400`         | Anulación OK ✅                                                                               |
| `101`         | Tarjeta caducada                                                                              |
| `102`         | Tarjeta en excepción transitoria                                                              |
| `106`         | Intentos de PIN excedidos                                                                     |
| `125`         | Tarjeta no efectiva                                                                           |
| `129`         | Código de seguridad (CVV2) incorrecto                                                         |
| `180`         | Tarjeta ajena al servicio                                                                     |
| `184`         | Error en autenticación 3DS2 (usuario no autenticó / canceló) — cubierto por regla `>= 100` ✅ |
| `190`         | Denegación sin especificar                                                                    |
| `191`         | Fecha de caducidad incorrecta                                                                 |
| `202`         | Tarjeta en lista negra                                                                        |
| `904`         | Comercio no registrado en FUC                                                                 |
| `909`         | Error de sistema                                                                              |
| `912`         | Emisor no disponible                                                                          |
| `9912`        | Emisor no disponible (timeout)                                                                |

---

## 11b. Tests — cómo correrlos y qué cubren

### Tests unitarios (`redsys-token-store.test.ts`)

**Ubicación:** `src/__tests__/lib/payments/redsys-token-store.test.ts`

**Correr:**

```bash
npm run test -- redsys-token-store
# o en modo watch:
npm run test:watch -- redsys-token-store
```

**Qué cubren (9 tests):**

| #   | Test                                                      | Qué verifica                                             |
| --- | --------------------------------------------------------- | -------------------------------------------------------- |
| 1   | `SESSION_TTL_MS equals 5 minutes`                         | La constante TTL son exactamente 300 000 ms              |
| 2   | `createSessionToken returns 64-char hex token`            | El token es hex de 64 chars (32 bytes crypto-aleatorios) |
| 3   | `createSessionToken generates unique tokens`              | Dos llamadas producen tokens distintos                   |
| 4   | `createSessionToken throws on DB insert error`            | Si Supabase falla el insert, propaga el error            |
| 5   | `consumeSessionToken returns session on first use`        | Token válido → devuelve la sesión completa               |
| 6   | `consumeSessionToken returns null for unknown token`      | Token inexistente → `null` (no lanza)                    |
| 7   | `consumeSessionToken returns null for used/expired token` | Fila con `used=true` → `null` (idempotencia)             |
| 8   | `consumeSessionToken returns null on DB error`            | Error de Supabase → `null` (no propaga)                  |
| 9   | `consumeSessionToken preserves lang and signedParams`     | Los datos de la sesión llegan intactos al caller         |

**Diseño de mocks:** Los tests usan mocks de Jest para `supabaseAdmin`. El helper `makeChain()` devuelve un objeto con métodos encadenables (`.from().delete()...`, `.from().insert()...`, `.from().update()...`) que se resuelven al hacer `await` o llamar `.single()`. Los mocks `mockDelete`, `mockInsert`, `mockUpdate` son `jest.fn()` que se pueden configurar por test para simular éxito o error.

### Test E2E visual (manual, dev local)

**Requisitos previos:**

- `npm run dev` corriendo en `localhost:3000`
- `ngrok http 3000` corriendo (actualizar `REDSYS_MERCHANT_URL`, `REDSYS_WEB_URLOK`, `REDSYS_WEB_URLKO` en `.env` con la URL ngrok)
- Usuario de prueba: `rodrigosamayoamorales@gmail.com` con sesión activa

**Flujo 1 — Múltiples artículos (subasta):**

```
http://localhost:3000/es/payment?auctionId=28
```

Seleccionar artículos NOT_PAID → continuar → Bridge page → formulario auto-submit → Redsys TPV test.

**Flujo 2 — Artículo único (Segunda Oportunidad):**

```
http://localhost:3000/es/single-payment?articleId=188
```

(artículo `mini pearl crush`, oferta ACCEPTED)

**Tarjeta de test Redsys:**
| Campo | Valor |
|-------|-------|
| Número | `4548 8120 4940 0004` |
| CVV | `123` |
| Caducidad | `12/26` |

**Verificar en DB después del pago:**

```sql
-- Token debe haberse consumido (used = true)
SELECT token, used, expires_at FROM "RedsysSessions" ORDER BY created_at DESC LIMIT 5;

-- UserPayment debe estar APPROVED
SELECT status, "paymentIntent", "chargeId" FROM "UserPayment"
WHERE "userId" = '9445778a-a466-476a-89f4-069bcdf3e5b7'
ORDER BY "createdAt" DESC LIMIT 3;
```

**Reset de datos de prueba (para repetir el test):**

```sql
-- Reset artículos a NOT_PAID
UPDATE "UserArticlesWon" SET status = 'NOT_PAID', "userPaymentId" = NULL
WHERE "articleId" IN (80, 81, 85) AND "userId" = '9445778a-a466-476a-89f4-069bcdf3e5b7';

-- Reset UserPayments de la última sesión
UPDATE "UserPayment" SET status = 'PENDING'
WHERE "userId" = '9445778a-a466-476a-89f4-069bcdf3e5b7'
  AND "createdAt" >= NOW() - INTERVAL '2 hours';

-- Reset ArticleSecondChance para flujo single
UPDATE "ArticleSecondChance" SET status = 'AVAILABLE' WHERE id = 188;
```

---

## 12. Días de trabajo — progreso

> Cada día tiene un objetivo concreto. Marca los checkboxes conforme avances. Al empezar un día nuevo, dale este fichero a la IA junto con el código de los archivos que vas a tocar (listados en "Archivos de contexto").
>
> **Convención de checkboxes:**  
> `- [ ]` = pendiente · `- [x]` = terminado · `- [~]` = en progreso / parcial

---

### Fase A — Backend Redsys (sin tocar app ni checkout web)

#### Día 1 — Utilidad de firma `redsys-sign.ts` 🔴 (3–5 h)

**Objetivo**: crear el módulo criptográfico que usan todos los demás archivos.

**Archivos de contexto para la IA**:

- `src/lib/payments/payment-intent.ts` (patrón de server action existente)
- Manual Redsys: sección de firma (ya resumida en Sección 11 de este plan)

**Tareas**:

- [x] Crear `src/lib/payments/redsys-sign.ts`
  - `generateRedsysOrder(): string` — **8 dígitos** de `Date.now()` + 4 hex random = 12 chars (los 4 primeros DEBEN ser numéricos; ver Sección 11)
  - `buildMerchantParameters(params: Record<string, string>): string` — JSON → Base64
  - `deriveKey(base64Key: string, order: string): Buffer` — **3DES (DES-EDE3-CBC) encrypt del ORDER** (zero-padded a múltiplo de 8) usando la merchant key como cipher key y **IV de ceros**. NO al revés (errar esto = SIS0042 silencioso).
  - `signParamsRedirection(order, paramsB64, merchantKey): string` — HMAC-SHA256 → Base64
  - `signParamsRest(order, paramsB64, merchantKey): string` — HMAC-SHA512 → Base64 (para firmar peticiones REST salientes; Día 8)
  - `verifyWebhookSignature(paramsB64, signature, order, merchantKey): boolean` — SOLO SHA256 (el webhook siempre llega con `HMAC_SHA256_V1`); usa `crypto.timingSafeEqual`
  - `decodeWebhookParams(b64): Record<string, string>` — Base64 → JSON

**Notas críticas**:

- La clave `REDSYS_MERCHANT_KEY` está en Base64; hay que `Buffer.from(key, 'base64')` antes de usarla
- El IV del cipher es el `DS_ORDER` (rellenar con ceros a 8 bytes si < 8 chars)
- **Algoritmo de derivación: 3DES del ORDER, NO al revés.** Cipher: `des-ede3-cbc`. Key: merchant key (24 bytes Base64-decoded para SHA-256, 16 bytes expandidos a 24 con K1|K2|K1 para SHA-512). IV: 8 bytes de ceros. Plaintext: el DS_ORDER UTF-8 zero-padded a múltiplo de 8. El ciphertext es la clave HMAC. Cualquier desviación (AES, IV=order, encriptar la key) produce SIS0042 "silencioso" (la pantalla de Redsys muestra importe 0 € y order vacío).
- Misma derivación para Redirección y REST; solo cambia el HMAC (SHA256 vs SHA512)
- `verifyWebhookSignature` solo necesita SHA256 — el webhook server-to-server SIEMPRE llega con `HMAC_SHA256_V1`. SHA512 se usa exclusivamente para firmar peticiones REST salientes (reembolsos).

---

#### Día 2 — Webhook Redsys + test con Bruno 🟡 (2–3 h)

**Objetivo**: recibir y procesar la notificación server-to-server de Redsys.

**Archivos de contexto para la IA**:

- `src/app/api/webhooks/stripe/route.ts` (modelo a seguir)
- `src/lib/payments/process-articles-payment.ts` (lo que se llama tras verificar el pago)
- `src/lib/payments/redsys-sign.ts` (recién creado, Día 1)
- `bruno/webhooks/` + `bruno/test-data/` (para entender cómo testear)

**Tareas**:

- [x] Crear `src/app/api/webhooks/redsys/route.ts`
  - Leer body form-encoded: `Ds_SignatureVersion`, `Ds_MerchantParameters`, `Ds_Signature`
  - Llamar `decodeWebhookParams(Ds_MerchantParameters)` → obtener `Ds_Order`, `Ds_Response`, `Ds_AuthorisationCode`
  - Llamar `verifyWebhookSignature(...)` — si falla → log + return 200 (Redsys reintenta si recibe != 200)
  - **Lookup en BD**: `SELECT id, userId, status FROM UserPayment WHERE paymentIntent = Ds_Order` (con `supabaseAdmin`). Si no existe o ya está APPROVED → return 200 (idempotencia).
  - Si `Ds_Response` entre `"000"` y `"099"`: llamar `processArticlesPayment(Ds_Order, Ds_AuthorisationCode, null, userPayment.userId)`
  - Si `Ds_Response >= "0100"`: llamar `rejectArticlesPayment(userPayment.id, ...)`
  - Siempre responder `HTTP 200` con body `"OK"`
- [x] Añadir archivo Bruno `bruno/webhooks/redsys.bru` para simular el webhook
  - ⚠️ Los archivos `.bru` deben escribirse **UTF-8 sin BOM** — si Bruno los muestra como "No Body", hay un BOM (0xEF 0xBB 0xBF) oculto. Solución en PowerShell: `New-Object System.Text.UTF8Encoding $false`
  - Requiere seleccionar el environment "Local" en Bruno para que `{{base_url}}` se resuelva
- [x] Añadir `bruno/test-data/redsys-webhook-setup.sql` con datos de prueba
  - ⚠️ La columna `description` de `UserPayment` es NOT NULL — el INSERT debe incluir `"description": ''` o falla
  - ⚠️ `processArticlesPayment` bifurca según `userPayment.auctionId`: si es NULL → flujo tienda online (`processSingleArticle`, requiere `ArticleSecondChance AVAILABLE`); si tiene valor → flujo subasta (`processMultipleArticles`, solo requiere `UserArticlesWon`). El test original no incluía `auctionId`, así que entró al flujo de tienda online y necesitó el **artículo 82** ("Vernis Brea MM"), el único con `ArticleSecondChance AVAILABLE` en dev. Para testear con los artículos ganados del usuario en subastas, incluir `auctionId` en el INSERT — ver `redsys-webhook-setup.sql` para la query de lookup.
  - Creado también `bruno/webhooks/redsys-rejected.bru` para testear flujo de rechazo
- [x] Verificado E2E: webhook aprobado (Ds_Response=0000) → `UserPayment.status=APPROVED`, `chargeId=272491` ✅
- [x] Verificado E2E: webhook rechazado (Ds_Response=0101) → `UserPayment.status=REJECTED`, `errorCode=0101` ✅
- [x] Modificar `src/lib/payments/process-articles-payment.ts`: cambiar `chargeId: string` → `chargeId: string | null` ✅

---

#### Día 3 — Bridge page + server action de sesión 🟡 (3–5 h)

**Objetivo**: generar la sesión de pago y servir el formulario que se auto-envía a Redsys.

**Archivos de contexto para la IA**:

- `src/lib/payments/redsys-sign.ts` (Día 1)
- `src/app/api/mobile/secure/user/payments/create-intent/route.ts` (patrón de endpoint móvil)

**Tareas**:

- [x] Crear `src/lib/payments/create-redsys-session.ts`
  - Input: `amount: number, selectedItems: number[], platform: 'web' | 'app', lang: string, userId: string`
  - Genera `redsysOrder` con `generateRedsysOrder()`
  - Construye params Redsys (amount en céntimos, **URLs concatenando `?order=${redsysOrder}` al final** para que las páginas de retorno puedan identificar el pago)
  - Firma con `signParamsRedirection()`
  - Guarda token efímero en `src/lib/payments/redsys-token-store.ts` (tabla `RedsysSessions`, TTL 5 min, single-use): `{ redsysOrder, signedParams, userId, lang, expiresAt, used }`
  - Devuelve `{ sessionToken, launchUrl: '/api/payments/redsys/launch?token=TOKEN', redsysOrder }`
- [x] Crear `src/app/api/payments/redsys/launch/route.ts`
  - `GET ?token=SESSION_TOKEN`
  - Valida token (existe + no expirado + marca como usado)
  - Devuelve HTML con `<form>` auto-submit a Redsys (test o prod según `REDSYS_ENVIRONMENT`)
- [x] Crear `src/app/api/mobile/secure/user/payments/create-redsys-session/route.ts`
  - Patrón de `create-intent/route.ts`; lee `userId` de `X-User-ID` (inyectado por middleware SECURE); llama `createRedsysSession('app', ...)` ✅

---

#### Día 4 — Infraestructura: CSP, env vars, job de limpieza ✅ COMPLETADO

**Objetivo**: completar la infraestructura necesaria antes de testear.

**Archivos de contexto para la IA**:

- `src/middlewares/nonce-middleware.ts` (CSP actual)
- `src/app/api/auto/_shared.ts` (BullMQ setup existente)
- `src/lib/payments/reject-articles-payment.ts` (a usar en el job)

**Tareas**:

- [x] Actualizar `src/middlewares/nonce-middleware.ts`
  - Añadida `form-action` a la CSP con dominios Redsys (`https://sis.redsys.es`, `https://sis-t.redsys.es:25443`)
  - Solo se activa cuando `pathname.startsWith('/api/payments/redsys/launch')`
  - Eliminados `scriptSrc`/`frameSrc` de `js.stripe.com` para rutas de pago
- [x] Añadir variables al `.env.example` — bloque completo Redsys + `CRON_SECRET`
- [ ] Sin cron job ni `vercel.json`
  - No se usará cron administrado por Vercel
  - La limpieza queda en el rechazo best-effort al reintentar pagos y soporte manual si alguna vez hiciera falta
- [x] `pnpm check-all` pasa limpio (exit 0, 89/89 tests, sin errores ESLint ni prettier)

**Variables de entorno para Redsys** (ver `.env.example`):

| Variable                   | Estado en `.env` local | Cuándo se necesita                                                                                 |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| `REDSYS_MERCHANT_CODE`     | ✅ `48491625`          | Ya                                                                                                 |
| `REDSYS_TERMINAL`          | ✅ `001`               | Ya                                                                                                 |
| `REDSYS_MERCHANT_KEY`      | ✅ SHA-256 key         | Ya                                                                                                 |
| `REDSYS_MERCHANT_KEY_REST` | ⚠️ placeholder corto   | Día 8 (reembolsos REST)                                                                            |
| `REDSYS_CURRENCY`          | ✅ `978`               | Ya                                                                                                 |
| `REDSYS_ENVIRONMENT`       | ✅ `test`              | Ya                                                                                                 |
| `REDSYS_MERCHANT_URL`      | ❌ vacío               | Necesita ngrok/tunnel para webhook local; en prod: `https://app.popauction.es/api/webhooks/redsys` |
| `REDSYS_WEB_URLOK`         | ❌ vacío               | Día 5 — se crea la página; en local: `http://localhost:3000/{lang}/payment/success?order=ORDER`    |
| `REDSYS_WEB_URLKO`         | ❌ vacío               | Día 5 — en local: `http://localhost:3000/{lang}/payment/error?order=ORDER`                         |
| `REDSYS_APP_URLOK`         | ✅ deep link app       | Ya                                                                                                 |
| `REDSYS_APP_URLKO`         | ✅ deep link app       | Ya                                                                                                 |

> **Nota sobre `REDSYS_WEB_URLOK/KO`**: el lang se concatena en `create-redsys-session.ts` al construir los params (`${REDSYS_WEB_URLOK}?order=${redsysOrder}`), no se hardcodea en la env var. La env var base no lleva `{lang}`.

---

### Fase B — Test end-to-end web

#### Día 5 — Páginas de retorno web (`/payment` refactor) 🟡 (4–6 h)

**Objetivo**: reemplazar el checkout Stripe embebido por el flujo de redirección Redsys.

**Archivos de contexto para la IA**:

- `src/app/[lang]/(main)/(protected)/(user)/payment/page.tsx` (estado actual, Sección 0 Flujo A)
- `src/components/payments/wrapper-stripe.tsx` (estado actual)
- `src/components/payments/checkout-page.tsx` (estado actual — contiene toda la lógica Stripe)
- `src/lib/payments/create-redsys-session.ts` (Día 3)
- `src/lib/payments/create-articles-payment.ts` (sin cambios, sigue creando el UserPayment)

**Tareas**:

- [x] Crear `src/app/[lang]/(main)/(protected)/(user)/payment/success/page.tsx`
  - Server Component, recibe `?order=DS_MERCHANT_ORDER`
  - Consulta `UserPayment` en BD donde `paymentIntent = order`
  - Si `status = APPROVED`: mostrar pantalla de éxito con importe
  - Si `status = PENDING`: mostrar "procesando..." (puede pasar si el webhook tarda)
  - Si `status = REJECTED` o no encontrado: mostrar error
  - Reutilizar la misma UI que `payment-success/page.tsx` actual (sin `statusMap` de Stripe)
- [x] Crear `src/app/[lang]/(main)/(protected)/(user)/payment/error/page.tsx`
  - Recibe `?order=DS_MERCHANT_ORDER` (Redsys incluye el order en la URL de error también)
  - Muestra error genérico + botón "Volver a intentarlo" → redirige a `/payment?auctionId=...`
- [x] Refactorizar `src/components/payments/wrapper-stripe.tsx` → **quitar Stripe**
- [x] Refactorizar `src/components/payments/checkout-page.tsx` → **quitar Stripe, añadir Redsys**
- [x] Test live con tarjeta Redsys `4548 8120 4940 0004` — pago de 1.975€ exitoso (orden `25127AD82115`)
- [x] Bugfix: `redsys-token-store.ts` usa `globalThis` para sobrevivir HMR de Next.js

---

#### Día 6 — Páginas de retorno `/single-payment` + test completo 🟡 (3–5 h)

**Objetivo**: mismo refactor que Día 5 pero para el flujo de artículo individual.

**Archivos de contexto para la IA**:

- `src/components/payments/wrapper-stripe-single.tsx` (estado actual)
- `src/components/payments/checkout-page-single.tsx` (estado actual)
- `src/app/[lang]/(main)/(protected)/(user)/single-payment-success/page.tsx` (estado actual)
- `src/lib/payments/process-single-article-payment.tsx` (tiene status checks Stripe a eliminar)
- Los archivos ya refactorizados del Día 5 (usar como modelo)

**Tareas**:

- [x] Refactorizar `src/components/payments/wrapper-stripe-single.tsx` → mismos cambios que `wrapper-stripe.tsx`
- [x] Refactorizar `src/components/payments/checkout-page-single.tsx` → mismos cambios que `checkout-page.tsx`
- [x] **Decisión tomada (ver §16)**: unificar páginas de éxito en una sola `/payment/success`. Borradas las carpetas `payment-success/` y `single-payment-success/`. La página `/payment/success/page.tsx` (Day 5) sirve para ambos flujos.
- [x] Actualizar `src/routes.ts` (eliminar `/payment-success` y `/single-payment-success`)
- [x] Actualizar test `create-redsys-session.test.ts` con la URL nueva
- [ ] Actualizar `src/lib/payments/process-single-article-payment.tsx`
  - **⚠️ Verificado: código muerto.** No es invocado desde ningún sitio (`grep -r processSingleArticlesPayment src/` solo se encuentra a sí mismo).
  - El webhook actual llama únicamente a `processArticlesPayment` (que maneja ambos casos por branch `auctionId`).
  - **Acción**: no refactorizar. Mover el `[ ]` de borrar este archivo al Día 9 (limpieza).
- [ ] Test local: configurar ngrok/tunnel para que Redsys alcance el webhook, probar con tarjetas de test Getnet

---

### Fase C - App movil (Expo)

#### Dia 7 - Hook `useRedsysPayment` + endpoints movil (hecho en codigo, pendiente QA) (3-5 h)

**Objetivo**: adaptar la app nueva para usar Redsys **sin romper los builds viejos que seguiran entrando por Stripe**.

> Para contexto de la app, consultar `AGENTS.md` o `CLAUDE.md` de este repo.

**Archivos de contexto para la IA**:

- Hook actual en la app: `src/hooks/payment/useStripePayment.ts` (repo app Expo)
- `app/(tabs)/account/payment.tsx` (repo app Expo)
- `app/(tabs)/account/single-payment.tsx` (repo app Expo)
- `src/app/api/mobile/secure/user/payments/create-redsys-session/route.ts` (repo web)
- `src/app/api/mobile/secure/config/route.ts` (repo web)

**Checklist dia 7**:

- [x] Crear `src/hooks/payment/useRedsysPayment.ts` en la app
  - `initializePaymentSession(amount, selectedItems)` -> POST `/payments/create-redsys-session` -> guarda `redsysOrder` y `launchUrl`
  - `openPaymentBrowser()` -> `WebBrowser.openAuthSessionAsync(launchUrl, 'popauctioonapp://')` -> parsea URL de retorno
  - Devuelve `{ success: boolean, error?, redsysOrderId }`
- [x] No borrar `useStripePayment.ts` ni el endpoint `CREATE_INTENT` en esta fase
- [x] Anadir `CREATE_REDSYS_SESSION` a `src/config/api-config.ts` en la app, manteniendo `CREATE_INTENT`
- [x] Actualizar `app/(tabs)/account/payment.tsx` en la app
- [x] Actualizar `app/(tabs)/account/single-payment.tsx` en la app
- [x] Actualizar `src/app/api/mobile/secure/config/route.ts` en web backend para seguir devolviendo `STRIPE_PUBLIC_KEY` y anadir flags de rollout Redsys
- [x] Anadir observabilidad minima del rollout movil
  - Log en `/create-intent`
  - Log en `/create-redsys-session`
  - Log en webhook Stripe
  - Log en webhook Redsys
- [ ] QA con **dos clientes**
  - Build viejo: debe seguir pagando por Stripe sin cambios
  - Build nuevo: debe pagar por Redsys
- [ ] Test en simulador iOS + Android / dispositivo real

**Cambios aplicados en esta iteracion**:

- **App Expo**
  - `src/hooks/payment/useRedsysPayment.ts` creado
  - `src/utils/payments/parse-redsys-return-url.ts` creado
  - `src/config/api-config.ts` actualizado con `CREATE_REDSYS_SESSION`
  - `app/(tabs)/account/payment.tsx` migrado a Redsys
  - `app/(tabs)/account/single-payment.tsx` migrado a Redsys
- **Web backend**
  - `src/app/api/mobile/secure/config/route.ts` actualizado con `MOBILE_PAYMENT_ROLLOUT` y `REDSYS_MERCHANT_CODE`
  - `src/app/api/mobile/secure/user/payments/create-intent/route.ts` con logs de coexistencia Stripe
  - `src/app/api/mobile/secure/user/payments/create-redsys-session/route.ts` con logs de adopcion Redsys
  - `src/app/api/webhooks/stripe/route.ts` con observabilidad minima
  - `src/app/api/webhooks/redsys/route.ts` con observabilidad minima

---

**Objetivo**: implementar la devolución de pagos ya realizados desde el panel de admin.

**Archivos de contexto para la IA**:

- `src/app/[lang]/(main)/(protected)/(admin)/check-sold-article/[id]/page.tsx` (donde irá el botón)
- `src/lib/payments/redsys-sign.ts` (Día 1 — necesita `signParamsRest`)
- `src/components/globals/delete-button.tsx` (patrón de botón de confirmación ya existente)
- Sección 3 de este plan (lógica anulación/devolución)

**Tareas**:

- [ ] Crear `src/lib/payments/create-redsys-refund.ts`
  - Input: `redsysOrder: string, amount: number, createdAt: Date`
  - Si `createdAt` es hoy → intenta `TRANSACTIONTYPE=9` (anulación)
    - Si `Ds_Response=400` → éxito, tipo `'anulacion'`
    - Si falla → caer a paso siguiente
  - `TRANSACTIONTYPE=3` (devolución)
    - Si `Ds_Response=900` → éxito, tipo `'devolucion'`
  - Devuelve `{ success, type, error? }`
- [ ] Añadir botón de devolución en `check-sold-article/[id]/page.tsx`
  - Solo visible si `payment.status === 'APPROVED'`
  - Usar `DeleteButton` (ya existe, hace confirm antes de ejecutar)
  - La action llama `createRedsysRefund(payment.paymentIntent, payment.totalAmount, payment.createdAt)`
  - Tras éxito: actualizar `UserPayment.status = REFUNDED` (puede requerir añadir el valor al enum `PaymentStatus`)
- [ ] Probar en entorno test: anulación mismo día, devolución día siguiente, fallback

---

### Fase E — Limpieza final

#### Día 9 — Limpieza segura por etapas 🟡 (2–4 h)

**Objetivo**: limpiar Stripe donde ya no aporta valor, **sin romper a los usuarios de app que todavía no actualizaron**.

**Archivos de contexto para la IA**:

- `package.json` del web y de la app
- `src/app/api/webhooks/stripe/route.ts` (**legacy app backend**; no borrar todavía)
- `src/lib/payments/payment-intent.ts` (**legacy app backend**; no borrar todavía)
- `src/lib/payments/retrieve-payment-information.ts` (ya sin uso tras Días 5+6)

**Tareas**:

- [ ] Verificar que `retrieve-payment-information.ts` ya no tiene importadores: `grep -r "retrieve-payment-information" src/`
- [ ] Borrar `src/lib/payments/retrieve-payment-information.ts`
- [ ] Borrar `src/lib/payments/process-single-article-payment.tsx` (código muerto verificado)
- [ ] En web: `npm uninstall @stripe/react-stripe-js @stripe/stripe-js`
- [ ] Mantener `stripe` server SDK mientras existan `create-intent` + `/api/webhooks/stripe` para app legacy
- [ ] En app nueva: quitar `@stripe/stripe-react-native` + `StripeProvider` **solo si el release nuevo ya quedó 100% Redsys**
- [ ] Mantener `src/app/api/mobile/secure/user/payments/create-intent/route.ts` durante coexistencia móvil
- [ ] Mantener `src/lib/payments/payment-intent.ts` durante coexistencia móvil
- [ ] Mantener `src/app/api/webhooks/stripe/route.ts` durante coexistencia móvil
- [ ] Mantener `STRIPE_PUBLIC_KEY` en `/api/mobile/secure/config` durante coexistencia móvil
- [ ] Verificar `npm run build` pasa sin errores
- [ ] Limpiar variables Stripe **web-only** de `.env.example` si ya no aplican, pero no borrar las que siga necesitando el backend móvil legado

**Criterio de retiro real de Stripe móvil**:

- Esperar a que la versión nueva de app esté publicada y con adopción suficiente.
- Confirmar por logs/métricas que `create-intent` y `/api/webhooks/stripe` ya no reciben tráfico relevante.
- Mantener una ventana de observación mínima de 2–4 semanas sin uso significativo antes de apagar endpoints legacy.
- Solo entonces ejecutar el borrado definitivo de:
  - `src/app/api/mobile/secure/user/payments/create-intent/route.ts`
  - `src/lib/payments/payment-intent.ts`
  - `src/app/api/webhooks/stripe/route.ts`
  - `stripe` server SDK

---

### Tabla de progreso rápida

| Día | Fase | Objetivo                                    | Estado |
| --- | ---- | ------------------------------------------- | ------ |
| 1   | A    | `redsys-sign.ts` — módulo criptográfico     | ⬜     |
| 2   | A    | Webhook Redsys + test Bruno                 | ⬜     |
| 3   | A    | Bridge page + server action sesión          | ⬜     |
| 4   | A    | CSP, env vars, job BullMQ                   | ⬜     |
| 5   | B    | Checkout web (`/payment`) refactor          | ⬜     |
| 6   | B    | Checkout web (`/single-payment`) + test e2e | ⬜     |
| 7   | C    | App: hook `useRedsysPayment` + endpoints    | hecho  |
| 8   | D    | Devoluciones admin                          | ⬜     |
| 9   | E    | Limpieza Stripe segura / coexistencia app   | ⬜     |

> Actualiza el ⬜ a ✅ conforme completas cada día.

---

## 13. Estimaciones de tiempo y dificultad

### Leyenda de dificultad

| Nivel    | Criterio                                                       |
| -------- | -------------------------------------------------------------- |
| 🟢 Fácil | Mecánico, sin complejidad técnica nueva                        |
| 🟡 Medio | Requiere leer código existente o implementar lógica no trivial |
| 🔴 Alto  | Criptografía, seguridad crítica, o muchas interdependencias    |

---

### Fase A — Backend

| #   | Tarea                                                       | Dificultad | Estimado     | Notas                                                                                                                                            |
| --- | ----------------------------------------------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `redsys-sign.ts` — firma HMAC + verificación webhook        | 🔴 Alto    | **3–5 h**    | Pieza más crítica. 3DES del order para derivar clave → HMAC SHA256 de parámetros en base64. Si falla aquí, todo falla silenciosamente (SIS0042). |
| 2   | `src/app/api/webhooks/redsys/route.ts`                      | 🟡 Medio   | **2–3 h**    | Decodificar `Ds_MerchantParameters`, verificar firma, llamar `processArticlesPayment`. Modelo: `/api/webhooks/stripe/`.                          |
| 3   | `src/app/api/payments/redsys/launch/route.ts` (bridge page) | 🟢 Fácil   | **1–2 h**    | GET → devuelve HTML con `<form>` auto-submit. Sin lógica de negocio.                                                                             |
| 4   | `create-redsys-session.ts`                                  | 🟡 Medio   | **2–3 h**    | Genera params firmados + guarda token efímero. Depende de `redsys-sign.ts`.                                                                      |
| 5   | Endpoint móvil `create-redsys-session/route.ts`             | 🟢 Fácil   | **1 h**      | Wrapper del server action. Modelo: `create-intent/route.ts`.                                                                                     |
| 6   | Job BullMQ limpieza de PENDING huérfanos                    | 🟡 Medio   | **2–3 h**    | Requiere entender setup de BullMQ existente. Lógica: query PENDING > 2h → `rejectArticlesPayment()`.                                             |
| 7   | CSP en `nonce-middleware.ts`                                | 🟢 Fácil   | **0.5 h**    | Reemplazar dominios Stripe por Redsys.                                                                                                           |
| 8   | Variables `.env.example`                                    | 🟢 Fácil   | **0.5 h**    | Añadir `REDSYS_*` vars.                                                                                                                          |
|     | **Total Fase A**                                            |            | **~12–17 h** |                                                                                                                                                  |

### Fase B — Test end-to-end web

| #   | Tarea                                           | Dificultad | Estimado    | Notas                                                                                                                 |
| --- | ----------------------------------------------- | ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| 9   | Páginas `payment/success` y `payment/error`     | 🟡 Medio   | **2–4 h**   | Server Components que leen `?order=` y consultan BD. UI de éxito/error.                                               |
| 10  | Adaptar checkout web (`checkoutPage`)           | 🟡 Medio   | **3–5 h**   | Reemplazar `<PaymentElement>` de Stripe por redirect a bridge page. Botón → fetch → redirect.                         |
| 11  | Prueba end-to-end con tarjetas de prueba Redsys | 🟡 Medio   | **3–5 h**   | Configurar URLs ngrok/tunnel para que Redsys pueda hacer POST al webhook en local. Depende de entorno de test Getnet. |
|     | **Total Fase B**                                |            | **~8–14 h** |                                                                                                                       |

### Fase C — App

| #   | Tarea                                           | Dificultad | Estimado     | Notas                                                                                                                                           |
| --- | ----------------------------------------------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 12  | `useRedsysPayment.ts` en la app                 | 🟡 Medio   | **2–4 h**    | `WebBrowser.openAuthSessionAsync` + parsear deep link de vuelta.                                                                                |
| 13  | `api-config.ts` + config backend de app         | 🟡 Medio   | **1–2 h**    | Añadir `CREATE_REDSYS_SESSION` sin borrar `CREATE_INTENT`; mantener `STRIPE_PUBLIC_KEY` y flags de coexistencia en `/api/mobile/secure/config`. |
| 14  | Actualizar `payment.tsx` y `single-payment.tsx` | 🟡 Medio   | **3–5 h**    | Reemplazar lógica Stripe por el hook nuevo en la app nueva. Manejar `type: 'cancel'` (usuario cierra modal).                                    |
| 15  | QA coexistencia: build viejo + build nuevo      | 🟡 Medio   | **3–5 h**    | Verificar Stripe legado y Redsys nuevo en paralelo. Incluye iOS/Android si ambas builds están disponibles.                                      |
| 16  | Observabilidad de adopción                      | 🟢 Fácil   | **1 h**      | Logs o métricas en `create-intent`, `create-redsys-session` y webhook Stripe para decidir el sunset real.                                       |
|     | **Total Fase C**                                |            | **~10–17 h** |                                                                                                                                                 |

### Fase D — Devoluciones y anulaciones admin

| #   | Tarea                                                             | Dificultad | Estimado   | Notas                                                                                                    |
| --- | ----------------------------------------------------------------- | ---------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 16  | `create-redsys-refund.ts` con lógica `TYPE=9` + fallback `TYPE=3` | 🟡 Medio   | **3–4 h**  | Firma HMAC SHA512. Lógica de decisión por fecha + fallback automático si batch ya cerró.                 |
| 16  | Nuevo botón/endpoint admin para reembolso de artículos `PAID`     | 🟡 Medio   | **2–3 h**  | Flujo nuevo, separado de `cancel-user-acquisition.ts` (que solo gestiona artículos no pagados).          |
| 17  | Prueba en entorno test: `TYPE=3`, `TYPE=9`, y fallback            | 🟡 Medio   | **2–4 h**  | Probar los tres caminos: devolución normal, anulación mismo día, y el fallback cuando el batch ya cerró. |
|     | **Total Fase D**                                                  |            | **~6–9 h** |                                                                                                          |

### Fase E — Limpieza

| #     | Tarea                                                       | Dificultad | Estimado   | Notas                                                                                               |
| ----- | ----------------------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 19–22 | Limpieza Stripe segura + preservación de backend legacy app | 🟡 Medio   | **2–4 h**  | Web puede limpiarse antes; endpoints/backend Stripe móvil se retiran solo tras ventana de adopción. |
|       | **Total Fase E**                                            |            | **~2–4 h** |                                                                                                     |

---

### Resumen total

| Fase                     | Estimado     | Bloqueo principal                                                        |
| ------------------------ | ------------ | ------------------------------------------------------------------------ |
| A — Backend              | 12–17 h      | `redsys-sign.ts` (criptografía crítica)                                  |
| B — Web end-to-end       | 8–14 h       | Tunnel para webhook local (ngrok/Cloudflare)                             |
| C — App                  | 10–17 h      | Coexistencia build viejo/build nuevo + comportamiento Android Custom Tab |
| D — Devoluciones/Anulac. | 6–9 h        | Probar fallback anulación→devolución                                     |
| E — Limpieza             | 2–4 h        | Definir sunset real de Stripe móvil                                      |
| **Total**                | **~38–61 h** | ≈ 5–8 días a jornada completa                                            |

> La mayor incertidumbre es cuánto tiempo tarda Getnet en proveer las credenciales de test y si el entorno de sandbox tiene limitaciones. El desarrollo puro de código (sin esperas externas) debería estar en el extremo bajo del rango.

---

## Referencias

- Manual REST v4.0.1: `9999_TPV-Virtual Manual Integración- Rest V 4.0.1.pdf` (en raíz del repo)
- Manual Redirección v3.0: `9999_TPV-Virtual Manual Integración - Redirección V3.0.pdf` (en raíz del repo)
- Stripe investigation (ES): `docs/stripe-investigacion-es.md`

---

## 14. Checklist de paso a producción

> Completar todos los ítems antes de cambiar `REDSYS_ENVIRONMENT=prod`. Los pasos están ordenados del más simple al más crítico.

---

### Paso 1 — Obtener credenciales de producción de Getnet

- [ ] Entrar al panel de Getnet con el comercio `48491625`
- [ ] Ir a **"Claves del comercio"** (Seguridad → Visualización Clave)
- [ ] Anotar las dos claves **de producción** que Getnet asigne cuando active el terminal real:
  - SHA-256 (32 chars) → irá a `REDSYS_MERCHANT_KEY`
  - SHA-512 (16 chars) → irá a `REDSYS_MERCHANT_KEY_REST`
- [ ] **Mientras el terminal siga en test**, las claves que aparecen son las públicas de Redsys (`sq7HjrUOBfKmC576ILgskD5srU870gJ7` / `sq7HjrUOBfKmC576`). Cuando Getnet active producción, cambiarán a claves privadas únicas.

---

### Paso 2 — Actualizar variables de entorno (servidor / Vercel)

| Variable                   | Valor en test                               | Valor en producción                                |
| -------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `REDSYS_ENVIRONMENT`       | `test`                                      | `prod`                                             |
| `REDSYS_MERCHANT_CODE`     | `48491625` ✅ ya correcto                   | `48491625` — **no cambia**                         |
| `REDSYS_TERMINAL`          | `001` ✅ ya correcto                        | `001` — **no cambia**                              |
| `REDSYS_MERCHANT_KEY`      | `sq7HjrUOBfKmC576ILgskD5srU870gJ7`          | clave SHA-256 real de Getnet                       |
| `REDSYS_MERCHANT_KEY_REST` | `sq7HjrUOBfKmC576`                          | clave SHA-512 real de Getnet                       |
| `REDSYS_MERCHANT_URL`      | (vacío o tunnel ngrok)                      | `https://app.popauction.es/api/webhooks/redsys`    |
| `REDSYS_WEB_URLOK`         | (vacío o localhost)                         | `https://app.popauction.es/{lang}/payment/success` |
| `REDSYS_WEB_URLKO`         | (vacío o localhost)                         | `https://app.popauction.es/{lang}/payment/error`   |
| `REDSYS_APP_URLOK`         | `popauctioonapp://payment-result?status=ok` | igual (deep link no cambia)                        |
| `REDSYS_APP_URLKO`         | `popauctioonapp://payment-result?status=ko` | igual (deep link no cambia)                        |

> `REDSYS_MERCHANT_CODE=48491625` es tu código real de comercio Getnet y es válido en **ambos entornos**. Es la única variable que usaremos para el merchant code.

---

### Paso 3 — Configurar las URLs en el panel de Getnet

En el panel de Getnet para el terminal `48491625-1`, actualizar:

| Campo en panel Getnet         | Valor a poner                                   |
| ----------------------------- | ----------------------------------------------- |
| **URL de notificación**       | `https://app.popauction.es/api/webhooks/redsys` |
| **URL OK (por defecto)**      | `https://app.popauction.es/es/payment/success`  |
| **URL KO (por defecto)**      | `https://app.popauction.es/es/payment/error`    |
| **Enviar parámetros en URLs** | `SI` (ya estaba marcado ✅)                     |

> Las URLs de retorno web son "por defecto"; el `DS_MERCHANT_ORDER` se concatena dinámicamente en `create-redsys-session.ts` con `?order=${redsysOrder}`.

---

### Paso 4 — Verificar que los tests no usan credenciales de producción

Los archivos de test están **aislados** de producción por diseño:

| Archivo                           | ¿Hardcodea credenciales? | ¿Seguro en prod? | Acción   |
| --------------------------------- | ------------------------ | ---------------- | -------- |
| `scripts/test-redsys-sign.mjs`    | Sí — clave pública test  | ✅ Sí            | No tocar |
| `scripts/test-redsys-live.mjs`    | Lee de `.env`            | ✅ Sí            | No tocar |
| `scripts/.redsys-test-form.html`  | Generado, en .gitignore  | ✅ Sí            | No tocar |
| `src/lib/payments/redsys-sign.ts` | No — recibe params       | ✅ Sí            | No tocar |

El golden vector test [6] en `test-redsys-sign.mjs` usa la clave pública de test de Redsys. **No cambia al ir a producción** — valida el algoritmo criptográfico, no las credenciales reales. Seguirá pasando siempre.

```bash
# Ejecutar antes de cualquier deploy a producción:
npx tsx scripts/test-redsys-sign.mjs
# Debe mostrar: 19 passed, 0 failed
```

---

### Paso 5 — Verificar el endpoint del webhook antes de activar prod

Redsys **no envía el webhook hasta que no recibe HTTP 200**. Verificar antes de cambiar las claves:

```bash
# Comprobar que /api/webhooks/redsys responde 200 (firma fallará pero el endpoint debe estar vivo):
curl -X POST https://app.popauction.es/api/webhooks/redsys \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Ds_SignatureVersion=HMAC_SHA256_V1&Ds_MerchantParameters=TEST&Ds_Signature=TEST"
# Debe devolver 200 aunque la firma sea inválida
```

- [ ] El endpoint responde HTTP 200
- [ ] Los logs de Sentry/servidor muestran la petición (aunque con firma inválida)
- [ ] `REDSYS_MERCHANT_URL` en el panel de Getnet apunta a la URL de producción correcta

---

### Paso 6 — Smoke test con tarjeta real en producción

Getnet puede proveer una tarjeta de prueba para el entorno de producción ("tarjeta de prueba en real"), o usar el importe mínimo (0,01 €) con una tarjeta real conocida y devolución inmediata.

| Acción                                 | Resultado esperado                                       |
| -------------------------------------- | -------------------------------------------------------- |
| Pago con tarjeta real por 0,01 €       | `UserPayment.status = APPROVED`, `chargeId` de 6 dígitos |
| Webhook llega a `/api/webhooks/redsys` | Log en Sentry/servidor, HTTP 200 devuelto                |
| Push notification llega al vendedor    | Cadena CDC → Supabase → push funciona                    |
| Devolución inmediata (Día 8)           | `Ds_Response=400` (anulación) si es mismo día            |

---

### Resumen: variables críticas a cambiar en producción

```bash
# ❌ Test — NO usar en producción
REDSYS_ENVIRONMENT=test
REDSYS_MERCHANT_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7  # clave pública de test
REDSYS_MERCHANT_KEY_REST=sq7HjrUOBfKmC576               # clave pública de test

# ✅ Producción — solo estas 3+URLs cambian
REDSYS_ENVIRONMENT=prod
REDSYS_MERCHANT_KEY=<clave SHA-256 real>                # del panel Getnet cuando activen prod
REDSYS_MERCHANT_KEY_REST=<clave SHA-512 real>           # del panel Getnet cuando activen prod
REDSYS_MERCHANT_URL=https://app.popauction.es/api/webhooks/redsys
REDSYS_WEB_URLOK=https://app.popauction.es/{lang}/payment/success
REDSYS_WEB_URLKO=https://app.popauction.es/{lang}/payment/error

# Estas NO cambian:
# REDSYS_MERCHANT_CODE=48491625   ← tu código real, válido en ambos entornos
# REDSYS_TERMINAL=001             ← idem
# REDSYS_CURRENCY=978             ← idem
# REDSYS_APP_URLOK/KO             ← deep links, idem
```

> Las URL vars deben estar sincronizadas entre las env vars del servidor y el panel de Getnet.

---

## 15. Decisiones pendientes

- **`payment/error` — botón "Intentar de nuevo"**: Se añadió un botón de retry en la página de error de Redsys que redirige a `/payment?auctionId=X`. Decidir si mantenerlo o eliminarlo y dejar solo el botón "Volver al inicio" (como el componente `PaymentError` original).

---

## 16. Unificación de páginas de éxito (Day 6 — decisión tomada)

### Antes (Stripe): dos páginas separadas

El flujo Stripe tenía dos URLs de éxito:

- `/[lang]/payment-success?payment_intent=pi_xxx` — flujo de subasta (`checkout-page.tsx`)
- `/[lang]/single-payment-success?payment_intent=pi_xxx` — flujo single (`checkout-page-single.tsx`)

**Por qué dos en Stripe**: cada `confirmPayment()` requería un `return_url` hardcodeado en el cliente. Cuando se añadió el flujo single (commit `7a962981`, nov 2024) se duplicó la URL por **simetría visual** (`/payment` → `/payment-success`, `/single-payment` → `/single-payment-success`), pero ambas páginas hacían exactamente lo mismo: `retrievePaymentInformation(paymentIntentId)` y mostrar `status` + `amount` + `receipt_url`. El código era idéntico.

### Ahora (Redsys): una sola página unificada

Bajo Redsys se usa **una única página** `/[lang]/payment/success?order=ORDER` para ambos flujos:

- Subasta: `checkout-page.tsx` → `createArticlesPayment()` → `UserPayment` (status=PENDING) → Redsys → `/payment/success?order=ORDER`
- Single: `checkout-page-single.tsx` → `createArticlePayment()` → `UserPayment` (status=PENDING) → Redsys → `/payment/success?order=ORDER`

**Por qué una sola es suficiente**:

1. Ambos flujos escriben en la **misma tabla `UserPayment`**, diferenciada por `paymentIntent` (que ahora guarda el `Ds_Order` de Redsys).
2. La página solo necesita leer `?order=` y consultar `UserPayment` en Supabase — no le importa si vino de subasta o single.
3. La URL de retorno la decide la env var `REDSYS_WEB_URLOK`, que es **única** para todos los pagos web. No hay forma natural de tener dos URLs sin añadir lógica extra al server action.
4. El webhook de Redsys también es único y unificado para ambos flujos.

### Consecuencias de la decisión

- ✅ Borrado: `src/app/[lang]/(main)/(protected)/(user)/payment-success/` (carpeta completa)
- ✅ Borrado: `src/app/[lang]/(main)/(protected)/(user)/single-payment-success/` (carpeta completa)
- ✅ Mantenido: `src/app/[lang]/(main)/(protected)/(user)/payment/success/page.tsx` (Day 5)
- ✅ Mantenido: `src/app/[lang]/(main)/(protected)/(user)/payment/error/page.tsx` (Day 5)
- ✅ Actualizado: `src/routes.ts` (eliminadas `/payment-success` y `/single-payment-success` del array `USER`)
- ✅ Actualizado: test `create-redsys-session.test.ts` para usar `/payment/success`
- ✅ Actualizado: comentario en `create-redsys-session.ts`

### Si en el futuro se necesitan mensajes distintos por flujo

La fila `UserPayment` se puede distinguir por:

- Si `articles.length === 1` y existe `articleSecondChanceId` → flujo single
- Si `articles.length >= 1` y existe `auctionId` → flujo subasta

La página `/payment/success` puede leer estos campos y mostrar copy distinto sin necesidad de duplicar la ruta.

---

## 17. Matriz de pruebas

> Esta matriz resume las pruebas de app nueva, app vieja y web para validar coexistencia Stripe/Redsys.

### Tabla A - App movil (build nuevo Redsys)

| Verificado | Flujo                              | Entrada                                        | Accion                                             | Resultado esperado en app                                                | Resultado esperado en backend/BD                                                                                                                              |
| ---------- | ---------------------------------- | ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [x]        | Pago subasta OK                    | `/(tabs)/account/payment?auctionId=28`         | Seleccionar direccion y pagar en Redsys            | Browser abre Redsys, vuelve por deep link y muestra pantalla de aprobado | Verificado en dev con user `rodrigosamayoamorales@gmail.com`: `UserPayment.id=257` aprobado, `UserArticlesWon(80,81,85)` en `PAID`, `userPaymentId=257`       |
| [x]        | Pago subasta cancelado             | `/(tabs)/account/payment?auctionId=28`         | Abrir Redsys, volver atras y confirmar cancelacion | Vuelve a app y muestra pantalla de rechazo                               | Verificado en dev con user `rodrigosamayoamorales@gmail.com`: Redsys devolvio cancelacion (`SIS9915`), los articulos quedaron en `DRAFT`, sin consolidar pago |
| [x]        | Pago subasta rechazado             | `/(tabs)/account/payment?auctionId=28`         | Completar con escenario KO de Redsys               | Vuelve a app con error                                                   | `UserPayment.status=REJECTED`                                                                                                                                 |
| [x]        | Reintento tras rechazo/cancelacion | `/(tabs)/account/payment?auctionId=28`         | Reabrir pago despues de KO/cancelacion             | La app permite volver a intentar el pago sin quedar bloqueada            | Los articulos siguen pagables; no quedan en `PAID` si el intento anterior fallo                                                                               |
| [x]        | Pago single OK                     | `/(tabs)/account/single-payment?articleId=110` | Seleccionar direccion y pagar                      | Igual que subasta OK                                                     | `UserPayment.status=APPROVED`, `paymentIntent=30243D7EEEB9`, `UserPayment.id=261`, `ArticleSecondChance.id=187`, `Article.id=110`                             |
| [x]        | Pago single cancelado              | `/(tabs)/account/single-payment?articleId=110` | Abrir Redsys y cerrar/cancelar                     | Sin exito                                                                | `UserPayment.status=REJECTED`                                                                                                                                 |
| [x]        | Pago single rechazado              | `/(tabs)/account/single-payment?articleId=110` | Escenario KO                                       | Error visible en app                                                     | `UserPayment.status=REJECTED`                                                                                                                                 |
| [x]        | Deep link OK                       | `popauctioonapp://payment-result?status=ok`    | Recibir redirect                                   | App interpreta `ok` correctamente                                        | Verificado en la pantalla `Pago aprobado`                                                                                                                     |
| [x]        | Deep link KO                       | `popauctioonapp://payment-result?status=ko`    | Recibir redirect                                   | App interpreta `ko` como fallo                                           | Verificado en la pantalla `Pago rechazado`                                                                                                                    |

### Preparacion de BD para cada prueba

Usa el playbook `docs/mobile-payment-db-reset-playbook.md` antes de ejecutar cada escenario. El objetivo es dejar el pago en estado repetible sin ensuciar historico.

- `Pago subasta OK`:
  - resetear `UserPayment` a `REJECTED` con `errorCode = 'MANUAL_RESET'`
  - resetear `UserArticlesWon` a `NOT_PAID`
  - no tocar `Article.sold`
  - verificado en app nueva con `rodrigosamayoamorales@gmail.com` sobre `auctionId=28`
  - Redsys retorno OK
  - DB final validada: `UserPayment.id=257`, articulos `80,81,85` en `PAID`
- `Pago subasta cancelado`:
  - mismo reset base que subasta OK
  - volver a intentar y cancelar antes del pago para confirmar rechazo limpio
  - verificado en app nueva con `rodrigosamayoamorales@gmail.com` sobre `auctionId=28`
  - se uso flecha atras de Redsys y luego continuar
  - Redsys mostro cancelacion de usuario `SIS9915`
  - app mostro pantalla de rechazo
  - DB final validada: articulos `80,81,85` quedaron en `DRAFT`, sin pago consolidado
- `Pago single OK`:
  - resetear `UserPayment`
  - resetear `ArticleSecondChance`
  - resetear `Article` a `sold = false` y `soldPrice = null` si ya se marco como vendido
  - extender `ArticleOffer.expiresAt` si la oferta ya vencio
  - verificado en app nueva con `rodrigosamayoamorales@gmail.com` sobre `articleId=110`
  - Redsys retorno OK
  - DB final validada: `UserPayment.id=261`, `paymentIntent=30243D7EEEB9`, `ArticleSecondChance.id=187` en `SOLD`, `Article.id=110` en `sold=true`, `ArticleOffer.id=69` vigente
- `Pago subasta rechazado`:
  - mismo reset base que subasta OK
  - completar el escenario KO de Redsys para verificar rechazo
- `Reintento tras rechazo/cancelacion`:
  - partir de un intento previo fallido o cancelado
  - verificar que la app sigue dejando entrar a `auctionId=28`
  - confirmar que el usuario puede lanzar Redsys otra vez sin soporte manual
- `Pago single cancelado`:
  - mismo reset base que single OK
  - cerrar Redsys antes de autorizar
- `Pago single rechazado`:
  - mismo reset base que single OK
  - completar un escenario KO en Redsys
- `Deep link OK / KO`:
  - no requiere reset de BD, solo validar el parseo del retorno

### Tabla B - Coexistencia movil (build viejo Stripe)

| Verificado | Flujo             | Cliente     | Accion                           | Resultado esperado                   | Observabilidad esperada                                                                        |
| ---------- | ----------------- | ----------- | -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [x]        | Pago legacy OK    | Build vieja | Pagar con Stripe                 | El flujo anterior sigue funcionando  | Verificado en build viejo: sigue entrando por `create-intent` y resolviendo el webhook Stripe  |
| [x]        | Pago legacy fallo | Build vieja | Forzar fallo Stripe              | Error normal de Stripe               | Verificado en build viejo: se conserva el fallo legacy y el log `MOBILE_PAYMENT_CREATE_INTENT` |
| [x]        | Config legacy     | Build vieja | Leer `/api/mobile/secure/config` | Sigue recibiendo `STRIPE_PUBLIC_KEY` | Verificado en build viejo: el contrato legacy no se rompe al coexistir con Redsys              |

### Tabla C - Web checkout Redsys

| Verificado | Flujo          | URL                                     | Accion           | Resultado esperado                           | Validacion                                                          |
| ---------- | -------------- | --------------------------------------- | ---------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| [x]        | Web subasta OK | `/[lang]/payment?auctionId=X`           | Pagar por Redsys | Redireccion a `/payment/success?order=ORDER` | Verificado en web: `UserPayment.status=APPROVED` y retorno correcto |
| [x]        | Web subasta KO | `/[lang]/payment?auctionId=X`           | Escenario KO     | Redireccion a `/payment/error?order=ORDER`   | Verificado en web: `UserPayment.status=REJECTED` y retorno correcto |
| [x]        | Web single OK  | `/[lang]/single-payment?articleId=X`    | Pagar por Redsys | Redireccion a `/payment/success?order=ORDER` | Verificado en web: `UserPayment.status=APPROVED` y retorno correcto |
| [x]        | Bridge page    | `/api/payments/redsys/launch?token=...` | Abrir URL        | HTML auto-submit a Redsys                    | Verificado en web: form action correcto segun `REDSYS_ENVIRONMENT`  |

### Tabla D - Webhooks y trazabilidad

| Verificado | Punto                  | Como probar                                             | Resultado esperado                                                                               |
| ---------- | ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [x]        | Webhook Redsys vivo    | POST manual a `/api/webhooks/redsys` con firma invalida | Verificado en web: responde HTTP 200                                                             |
| [x]        | Webhook Redsys pago OK | Pago real/sandbox aprobado                              | Verificado en web: log `MOBILE_PAYMENT_REDSYS_WEBHOOK`, procesamiento aprobado                   |
| [x]        | Webhook Stripe legacy  | Pago desde build vieja                                  | Verificado en web: log `MOBILE_PAYMENT_STRIPE_WEBHOOK`                                           |
| [x]        | Config coexistencia    | GET `/api/mobile/secure/config?type=basic`              | Verificado en web: incluye `STRIPE_PUBLIC_KEY`, `REDSYS_MERCHANT_CODE`, `MOBILE_PAYMENT_ROLLOUT` |

### Checklist operativo de prueba

- [x] Backend web levantado con envs Redsys de test
- [x] App nueva abre Redsys desde subasta
- [x] App nueva abre Redsys desde single
- [x] Cancelacion manual devuelve rechazo limpio en app
- [x] Retorno KO devuelve rechazo limpio en app
- [x] Retorno OK termina en historial y `APPROVED`
- [x] Build vieja sigue pagando por Stripe
- [x] Logs de coexistencia aparecen en servidor
- [x] Webhook Redsys responde 200 siempre
- [x] `paymentIntent` guarda el `redsysOrder` en la app nueva

---

## 18. Cómo probar el flujo desde la app

> Esta sección deja un paso a paso operativo para validar la app nueva con Redsys y la coexistencia con builds viejos que siguen usando Stripe.

### Qué debe estar corriendo

- `PopAuction-Web` levantado con `pnpm dev`
- App Expo nueva levantada con `pnpm start` o instalada en un device/build que soporte deep links
- Entorno de test de Redsys configurado en el backend

### Variables mínimas que deben existir en web

- `REDSYS_ENVIRONMENT=test`
- `REDSYS_MERCHANT_CODE`
- `REDSYS_MERCHANT_KEY`
- `REDSYS_MERCHANT_URL`
- `REDSYS_APP_URLOK=popauctioonapp://payment-result?status=ok`
- `REDSYS_APP_URLKO=popauctioonapp://payment-result?status=ko`

### Flujo 1 - App nueva / pago de subasta

1. Abrir la app nueva con un usuario que tenga artículos ganados pendientes de pago.
2. Entrar a `/(tabs)/account/payment?auctionId=X`.
3. Seleccionar dirección.
4. Pulsar pagar.
5. Confirmar que se abre Redsys en el browser.
6. Completar el caso `OK`.

Resultado esperado:

- La app vuelve por deep link.
- Se muestra feedback de éxito.
- Navega a `payments-history`.
- En backend aparece el log de `create-redsys-session`.
- Llega webhook Redsys.
- En BD, `UserPayment.paymentIntent = redsysOrder`.
- En BD, `UserPayment.status = APPROVED`.

### Flujo 2 - App nueva / pago single

1. Abrir `/(tabs)/account/single-payment?articleId=X`.
2. Seleccionar dirección.
3. Pulsar pagar.
4. Completar el caso `OK`.

Resultado esperado:

- Mismo comportamiento que subasta.
- En BD, el `UserPayment` queda aprobado.
- El `paymentIntent` guarda el `Ds_Order` de Redsys.

### Flujo 3 - Cancelación manual en app nueva

1. Abrir cualquiera de los dos flujos de pago de la app nueva.
2. Llegar a Redsys.
3. Cerrar el browser o cancelar antes de pagar.

Resultado esperado:

- La app no debe marcar éxito.
- No debe navegar a historial como pago aprobado.
- El flujo local debe tratarlo como cancelación.
- El `UserPayment` creado debe quedar rechazado mediante `rejectPayment(...)`.

### Flujo 4 - Rechazo KO en app nueva

1. Abrir cualquiera de los dos flujos de pago de la app nueva.
2. Completar un escenario KO de Redsys.

Resultado esperado:

- La app vuelve por deep link con error.
- No hay navegación de éxito.
- El `UserPayment` queda `REJECTED`.

### Flujo 5 - Deep link directo

Probar manualmente:

- `popauctioonapp://payment-result?status=ok&order=ORDER`
- `popauctioonapp://payment-result?status=ko&order=ORDER`

Resultado esperado:

- El parser distingue `ok` y `ko`.
- El hook resuelve correctamente éxito o fallo.

### Flujo 6 - Build vieja / coexistencia Stripe

1. Instalar una build vieja real de la app.
2. Iniciar un pago normal desde esa build.

Resultado esperado:

- La build vieja sigue llamando `create-intent`.
- Sigue recibiendo `STRIPE_PUBLIC_KEY` desde `/api/mobile/secure/config`.
- Sigue abriendo Stripe, no Redsys.
- El backend procesa el webhook de Stripe.
- No se rompe el contrato legacy.

### Qué mirar en logs y BD

- Log `MOBILE_PAYMENT_CREATE_REDSYS_SESSION`
- Log `MOBILE_PAYMENT_REDSYS_WEBHOOK`
- Log `MOBILE_PAYMENT_CREATE_INTENT` para la build vieja
- Log `MOBILE_PAYMENT_STRIPE_WEBHOOK` para la build vieja
- `UserPayment.paymentIntent`
- `UserPayment.status`

---

## 19. Nivel de confianza y por qué debería funcionar

> Este bloque no sustituye QA real, pero deja claro por qué el diseño actual minimiza el riesgo en coexistencia y migración.

### Por qué la app nueva con Redsys debería funcionar

1. El flujo en app se ejecuta en el orden correcto:
   - crear sesión Redsys
   - crear `UserPayment` en `PENDING`
   - abrir `openAuthSessionAsync`
   - interpretar deep link `ok/ko/cancel`
   - rechazar localmente en cancelación o KO
2. El backend móvil nuevo usa un endpoint dedicado (`create-redsys-session`) en lugar de mutar el contrato legacy de Stripe.
3. El webhook de Redsys procesa por `Ds_Order`, que coincide con lo guardado en `UserPayment.paymentIntent`.
4. El webhook Redsys quedó idempotente y responde `HTTP 200`, que es el comportamiento esperado por Redsys.

### Por qué los clientes del build viejo deberían seguir funcionando

1. No se eliminaron los endpoints legacy de Stripe.
2. `POST /api/mobile/secure/user/payments/create-intent` sigue existiendo.
3. `/api/mobile/secure/config` sigue devolviendo `STRIPE_PUBLIC_KEY`.
4. El webhook de Stripe sigue activo.
5. El rollout móvil quedó en dual-stack temporal, diseñado precisamente para binarios viejos y nuevos coexistiendo.

### Qué nos da confianza técnica en la coexistencia

- La app nueva y la vieja no comparten el mismo endpoint de inicio de pago.
- La app vieja sigue entrando por Stripe.
- La app nueva entra por Redsys.
- El backend acepta ambos caminos a la vez.
- La decisión de retirar Stripe móvil no depende de fecha, sino de evidencia de tráfico.

### Qué NO asegura este plan por sí solo

- No garantiza que un device concreto no tenga problemas de deep link si no se prueba.
- No garantiza que Android/iOS se comporten igual sin QA real.
- No garantiza que una build vieja específica siga sana hasta probarla contra staging o producción controlada.

### Criterio de salida razonable antes de considerar estable el cambio

- App nueva probada en subasta y single con `OK`, `KO` y cancelación.
- Build vieja probada al menos una vez con Stripe real.
- Webhook Redsys verificado con pago real o sandbox.
- Logs de coexistencia visibles en servidor.
- Confirmación en BD de que Redsys guarda `paymentIntent = Ds_Order`.

## 20. Resumen operativo en tablas

> Versión resumida y ordenada de pruebas y confianza para usar como checklist rápido.

### Tabla A - Prerrequisitos

| Tipo    | Item          | Valor / acción esperada                                                                 |
| ------- | ------------- | --------------------------------------------------------------------------------------- |
| Backend | Web corriendo | `PopAuction-Web` levantado con `pnpm dev`                                               |
| App     | Cliente nuevo | App Expo nueva levantada con `pnpm start` o instalada en un device/build con deep links |
| Redsys  | Entorno       | `REDSYS_ENVIRONMENT=test`                                                               |
| Redsys  | Merchant code | `REDSYS_MERCHANT_CODE` configurado                                                      |
| Redsys  | Firma         | `REDSYS_MERCHANT_KEY` configurado                                                       |
| Redsys  | Webhook       | `REDSYS_MERCHANT_URL` configurado                                                       |
| App     | Deep link OK  | `REDSYS_APP_URLOK=popauctioonapp://payment-result?status=ok`                            |
| App     | Deep link KO  | `REDSYS_APP_URLKO=popauctioonapp://payment-result?status=ko`                            |

### Tabla B - Flujos app nueva

| Flujo        | Entrada                                                 | Pasos                                                              | Resultado esperado en app                                         | Validación en backend / BD                                                                                              |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Subasta OK   | `/(tabs)/account/payment?auctionId=X`                   | Abrir pago, seleccionar dirección, pagar en Redsys, completar `OK` | Vuelve por deep link, muestra éxito y navega a `payments-history` | Log `create-redsys-session`, webhook Redsys, `UserPayment.paymentIntent = redsysOrder`, `UserPayment.status = APPROVED` |
| Single OK    | `/(tabs)/account/single-payment?articleId=X`            | Abrir pago, seleccionar dirección, pagar en Redsys, completar `OK` | Igual que subasta OK                                              | `UserPayment.status = APPROVED`, `paymentIntent = redsysOrder`                                                          |
| Cancelación  | Cualquiera de los dos flujos nuevos                     | Abrir Redsys y cerrar/cancelar antes de pagar                      | No navega a éxito ni muestra pago aprobado                        | `UserPayment.status = REJECTED` mediante `rejectPayment(...)`                                                           |
| Rechazo KO   | Cualquiera de los dos flujos nuevos                     | Completar escenario KO de Redsys                                   | Vuelve con error, sin navegación de éxito                         | `UserPayment.status = REJECTED`                                                                                         |
| Deep link OK | `popauctioonapp://payment-result?status=ok&order=ORDER` | Lanzar manualmente la URL                                          | La app interpreta `ok` como éxito                                 | El hook resuelve `success=true`                                                                                         |
| Deep link KO | `popauctioonapp://payment-result?status=ko&order=ORDER` | Lanzar manualmente la URL                                          | La app interpreta `ko` como fallo                                 | El hook resuelve `success=false`                                                                                        |

### Tabla C - Coexistencia build vieja

| Flujo             | Cliente          | Pasos                                         | Resultado esperado                         | Validación                                                                                |
| ----------------- | ---------------- | --------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Pago legacy OK    | Build vieja real | Instalar build vieja e iniciar un pago normal | Sigue usando Stripe, no Redsys             | Verificado en build viejo: sigue entrando por `create-intent` y procesando webhook Stripe |
| Pago legacy fallo | Build vieja real | Forzar un fallo de Stripe                     | Mantiene el comportamiento legacy de error | Verificado en build viejo: el error legacy sigue intacto                                  |
| Config legacy     | Build vieja real | Leer `/api/mobile/secure/config`              | No se rompe el contrato anterior           | Verificado en build viejo: la respuesta sigue incluyendo `STRIPE_PUBLIC_KEY`              |

### Tabla D - Motivos de confianza

| Área               | Motivo de confianza                      | Por qué importa                                                                                                                                      |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| App nueva          | El flujo se ejecuta en el orden correcto | Crea sesión Redsys, crea `UserPayment` en `PENDING`, abre `openAuthSessionAsync`, interpreta `ok/ko/cancel` y rechaza localmente en cancelación o KO |
| Backend nuevo      | Redsys entra por endpoint dedicado       | `create-redsys-session` no rompe el contrato legacy de Stripe                                                                                        |
| Webhook Redsys     | Procesa por `Ds_Order`                   | Coincide con `UserPayment.paymentIntent`, lo que simplifica lookup e idempotencia                                                                    |
| Integración Redsys | Respuesta `HTTP 200` e idempotencia      | Es el comportamiento esperado por Redsys para no reintentar indefinidamente                                                                          |
| Coexistencia       | Dual-stack temporal                      | Permite que build nueva y build vieja convivan sin apagar Stripe de golpe                                                                            |

### Tabla E - Qué sí y qué no

| Tipo | Afirmación                                                                                    |
| ---- | --------------------------------------------------------------------------------------------- |
| Sí   | La app nueva y la vieja no comparten el mismo endpoint de inicio de pago                      |
| Sí   | La app vieja sigue entrando por Stripe y la nueva por Redsys                                  |
| Sí   | El backend acepta ambos caminos a la vez                                                      |
| Sí   | La retirada de Stripe móvil está diseñada para depender de evidencia de tráfico y no de fecha |
| No   | No se puede garantizar comportamiento perfecto en todos los devices sin QA real               |
| No   | No se puede garantizar equivalencia iOS/Android sin prueba real                               |
| No   | No se puede dar por sano un build viejo concreto sin instalarlo y pagar con él                |
