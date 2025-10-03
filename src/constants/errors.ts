/**
 * Constantes de errores y códigos de servicios externos
 */
import type { ErrorMessages } from '@/types/types';

export const STRIPE_ERROR_CODES: ErrorMessages = {
  card_declined: {
    en: 'Your card was declined. Please try again or contact your bank.',
    es: 'Tu tarjeta fue rechazada. Por favor, inténtalo de nuevo o contacta a tu banco.',
  },
  expired_card: {
    en: 'Your card has expired. Please use a different card.',
    es: 'Tu tarjeta ha caducado. Por favor, utiliza una tarjeta diferente.',
  },
  payment_intent_authentication_failure: {
    en: 'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
    es: 'No podemos autenticar tu método de pago. Por favor, elige un método de pago diferente e inténtalo de nuevo.',
  },
  incorrect_cvc: {
    en: 'The CVC code is incorrect. Please check and try again.',
    es: 'El código CVC es incorrecto. Por favor, revisa e inténtalo de nuevo.',
  },
  insufficient_funds: {
    en: 'There are insufficient funds on your card. Please use a different payment method.',
    es: 'No hay fondos suficientes en tu tarjeta. Por favor, utiliza un método de pago diferente.',
  },
  invalid_card_number: {
    en: 'The card number is invalid. Please check and try again.',
    es: 'El número de la tarjeta es inválido. Por favor, revisa e inténtalo de nuevo.',
  },
  processing_error: {
    en: 'An error occurred while processing your card. Please try again later.',
    es: 'Ocurrió un error al procesar tu tarjeta. Por favor, inténtalo de nuevo más tarde.',
  },
  authentication_required: {
    en: 'Authentication is required. Please complete the authentication to proceed.',
    es: 'Se requiere autenticación. Por favor, completa la autenticación para continuar.',
  },
  incorrect_number: {
    en: 'The card number is incorrect. Please check and try again.',
    es: 'El número de la tarjeta es incorrecto. Por favor, revisa e inténtalo de nuevo.',
  },
  invalid_expiry_month: {
    en: "The card's expiration month is invalid. Please check and try again.",
    es: 'El mes de expiración de la tarjeta es inválido. Por favor, revisa e inténtalo de nuevo.',
  },
  invalid_expiry_year: {
    en: "The card's expiration year is invalid. Please check and try again.",
    es: 'El año de expiración de la tarjeta es inválido. Por favor, revisa e inténtalo de nuevo.',
  },
  invalid_cvc: {
    en: 'The CVC code is invalid. Please check and try again.',
    es: 'El código CVC es inválido. Por favor, revisa e inténtalo de nuevo.',
  },
  invalid_request_error: {
    en: 'There was an invalid request. Please check the details and try again.',
    es: 'Hubo una solicitud inválida. Por favor, revisa los detalles e inténtalo de nuevo.',
  },
  rate_limit: {
    en: 'Too many requests in a short period of time. Please wait and try again later.',
    es: 'Demasiadas solicitudes en un corto período de tiempo. Por favor, espera e inténtalo de nuevo más tarde.',
  },
};
