import React from 'react';
import { View } from 'react-native';
import { CustomLink } from '@/components/ui/CustomLink';
import { CustomImage } from '@/components/ui/CustomImage';
import { CustomText } from '@/components/ui/CustomText';
import { getMonthName } from '@/utils/calendar';
import { Lang } from '@/types/types';

interface AuctionCalendarCardProps {
  auction: {
    id: string;
    title: string;
    startDate: string;
    image?: string | null;
  };
  locale: Lang;
  formatTime: (dateString: string) => string;
}

export function AuctionCalendarCard({
  auction,
  locale,
  formatTime,
}: AuctionCalendarCardProps) {
  return (
    <CustomLink
      key={auction.id}
      href={`/(tabs)/auctions/${auction.id}`}
      mode='empty'
    >
      <View className='overflow-hidden rounded-xl shadow-sm'>
        <View className='min-h-[220px] flex-row py-6'>
          {/* Imagen grande a la izquierda */}
          <View className='bg-gray-100 mr-3 h-56 w-44 overflow-hidden rounded-lg'>
            {auction.image && auction.image.trim() !== '' ? (
              <CustomImage
                src={auction.image}
                alt={auction.title || 'Auction image'}
                className='h-full w-full'
                resizeMode='cover'
              />
            ) : null}
          </View>

          {/* Grid de contenido a la derecha */}
          <View className='flex-1 pr-2'>
            {/* Fila superior: Fecha y Hora con espacio entre ellas */}
            <View className='mb-2 flex-row items-end gap-2'>
              {/* Fecha a la izquierda */}
              <View>
                <CustomText
                  type='subtitle'
                  className='text-xl text-cinnabar'
                >
                  {getMonthName(
                    new Date(auction.startDate).getMonth() + 1,
                    locale
                  ).toUpperCase()}
                </CustomText>
                <CustomText
                  type='subtitle'
                  className='text-xl text-cinnabar'
                >
                  {new Date(auction.startDate).getDate()},{' '}
                  {new Date(auction.startDate).getFullYear()}
                </CustomText>
              </View>
              {/* Hora a la derecha */}
              <View>
                <CustomText
                  type='subtitle'
                  className='text-right text-xl text-cinnabar'
                >
                  {formatTime(auction.startDate)}
                </CustomText>
              </View>
            </View>

            {/* Título de la subasta abajo */}
            <View className='pr-2'>
              <CustomText
                type='h3'
                className=''
              >
                {auction.title.toUpperCase()}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    </CustomLink>
  );
}
