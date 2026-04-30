import { View } from 'react-native';
import { CustomText } from '@/components/ui/CustomText';
import { useHighestBidderContext } from '@/context/highest-bidder-context';
import { CustomImage } from '@/components/ui/CustomImage';

export const LiveHighestBidder = ({
  insetsTop,
  UI,
  Z,
}: {
  insetsTop: number;
  UI: {
    SCREEN_PADDING: number;
    BACK_TOP_GAP: number;
    BACK_SIZE: number;
  };
  Z: {
    BACK: number;
  };
}) => {
  const { state } = useHighestBidderContext();

  if (!state.highestBidder) {
    return null;
  }

  return (
    <View
      className='flex flex-row items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white/70 px-3 py-2'
      style={{
        position: 'absolute',
        right: UI.SCREEN_PADDING,
        top: insetsTop + UI.BACK_TOP_GAP,
        zIndex: Z.BACK,
        elevation: Z.BACK,
        alignSelf: 'flex-end',
      }}
    >
      {state.highestBidderImage && (
        <CustomImage
          src={state.highestBidderImage}
          alt={state.highestBidder}
          className='h-7 w-7 rounded-full'
          resizeMode='cover'
        />
      )}
      <CustomText
        type='h4'
        className='text-center text-cinnabar'
      >
        {state.highestBidder}
      </CustomText>
    </View>
  );
};
