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
            ) : (
              <View className='bg-gray-200 h-full w-full items-center justify-center'>
                <CustomText type='h1'>🏺</CustomText>
              </View>
            )}
          </View>

          {/* Grid de contenido a la derecha */}
          <View className='flex-1 pr-2'>
            {/* Layout principal: Fecha y Hora */}
            <View className='flex-row items-start justify-between'>
              {/* Columna izquierda: Fecha y Título */}
              <View className='flex-1 '>
                {/* Fecha */}
                <View className='mb-2'>
                  <CustomText
                    type='subtitle'
                    className=''
                  >
                    {getMonthName(
                      new Date(auction.startDate).getMonth() + 1,
                      locale
                    ).toUpperCase()}
                  </CustomText>
                  <CustomText
                    type='h4'
                    className=''
                  >
                    {new Date(auction.startDate).getDate()},{' '}
                    {new Date(auction.startDate).getFullYear()}
                  </CustomText>
                </View>

                {/* Título justo debajo de la fecha */}
                <View className='w-full  pr-2'>
                  <CustomText
                    type='h3'
                    className=''
                  >
                    {auction.title.toUpperCase()}
                  </CustomText>
                </View>
              </View>

              {/* Hora - derecha con más ancho */}
              <View className='min-w-[50px] max-w-[100px]'>
                <CustomText
                  type='h3'
                  className='text-right'
                >
                  {formatTime(auction.startDate)}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </CustomLink>
  );
}
