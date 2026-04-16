import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { CustomImage } from '@/components/ui/CustomImage';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { formatPaymentDate } from '@/utils/calendar';
import { UserPaymentStatusLabels } from '@/constants/payment';
import type { UserPayment } from '@/types/types';
import { CustomLink } from '../ui/CustomLink';
import { euroFormatter } from '@/utils/euroFormatter';

interface PaymentCardProps {
  payment: UserPayment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const { t, locale } = useTranslation();
  const formatter = euroFormatter(locale);

  return (
    <View className='my-3 mb-4 flex-row overflow-hidden rounded-3xl bg-white p-2 shadow-sm'>
      {/* Imagen del primer artículo a la izquierda - ocupa ~40% del ancho */}
      <View className='bg-gray-100 mr-4 w-[45%] overflow-hidden rounded-lg'>
        {payment.articles[0]?.images[0] ? (
          <CustomImage
            src={payment.articles[0].images[0]}
            alt={payment.articles[0].title}
            className='aspect-square w-full'
            resizeMode='cover'
          />
        ) : (
          <View className='bg-gray-200 aspect-square w-full items-center justify-center' />
        )}
      </View>

      {/* Información del pago a la derecha - ocupa ~55% del ancho */}
      <View className='flex-1 justify-between'>
        <View className='gap-1'>
          {/* Status */}
          <CustomText
            type='body'
            className='font-semibold text-cinnabar'
          >
            {UserPaymentStatusLabels[
              payment.status as keyof typeof UserPaymentStatusLabels
            ]?.[locale] || payment.status}
          </CustomText>

          {/* Fecha y hora */}
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {formatPaymentDate(payment.createdAt, locale)}
          </CustomText>

          {/* Título de la subasta o "Online Store" */}
          <CustomText
            type='body'
            className='font-semibold text-cinnabar'
          >
            {payment.auction?.title ?? t('screens.paymentsHistory.onlineStore')}
          </CustomText>

          {/* Total amount */}
          <CustomText
            type='body'
            className='text-cinnabar'
          >
            {t('screens.paymentsHistory.totalAmount').toUpperCase()}:{' '}
            <CustomText
              type='body'
              className='font-bold'
            >
              {formatter.format(payment.totalAmount)}
            </CustomText>
          </CustomText>

          {/* Articles paid count */}
          <CustomText
            type='body'
            className='text-gray-600'
          >
            {t('screens.paymentsHistory.articlesPaid')}:{' '}
            {payment.articlesPaid.length}
          </CustomText>
        </View>

        {/* Botón para ver el pago (solo si está aprobado) */}
        {payment.status === 'APPROVED' && (
          <View className='mt-3'>
            <CustomLink
              mode='secondary'
              size='small'
              href={`/(tabs)/account/payment/${payment.id}`}
            >
              {t('screens.paymentsHistory.viewPayment')}
            </CustomLink>
          </View>
        )}
      </View>
    </View>
  );
}
