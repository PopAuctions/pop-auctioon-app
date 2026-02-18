import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { CustomLink } from '@/components/ui/CustomLink';
import { AuctionSubscriber } from '@/components/subscribers/AuctionSubscriber';
import { useAuctionStartedModal } from '@/context/auction-started-context';
import { useFetchNowNextAuction } from '@/hooks/components/useFetchNowNextAuction';
import { AuctionStatus } from '@/constants/auctions';
import { useAuthNavigation } from '@/hooks/auth/useAuthNavigation';

type Props = {
  /**
   * Size of the red dot in px
   */
  size?: number;
  /**
   * Extra offset from the top
   */
  top?: number;
  /**
   * Extra offset from the right
   */
  right?: number;
  /**
   * Optional extra styles (positioning, etc.)
   */
  style?: ViewStyle;
};

export const LiveSignal = ({
  size = 10,
  top = 12,
  right = 12,
  style,
}: Props) => {
  const firstFetchResponse = useRef(true);
  const { openAuctionStartedAlertModal } = useAuctionStartedModal();
  const { data, refetch } = useFetchNowNextAuction({ firstFetchResponse });
  const { navigateWithAuth } = useAuthNavigation();
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const auctionId = data?.auctionId;
  const auctionStatus = data?.status;

  const hitboxStyle = StyleSheet.flatten([
    styles.hitbox,
    { top, right },
    style,
  ]);

  const handleStatusChange = () => {
    refetch?.();
    setVisible(true);
    openAuctionStartedAlertModal(auctionId ?? undefined);
  };

  useEffect(() => {
    if (firstFetchResponse.current && auctionStatus === AuctionStatus.LIVE) {
      if (!auctionId) {
        navigateWithAuth('/(tabs)/auctions');
        return;
      }
      navigateWithAuth(`/(tabs)/auctions/live/${auctionId}`);
    }
  }, [
    auctionStatus,
    navigateWithAuth,
    auctionId,
    openAuctionStartedAlertModal,
    firstFetchResponse,
  ]);

  useEffect(() => {
    if (!visible) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.35,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      scale.setValue(1);
      opacity.setValue(1);
    };
  }, [visible, opacity, scale]);

  if (!auctionId) return null;

  if (auctionStatus === AuctionStatus.AVAILABLE) {
    return (
      <AuctionSubscriber
        auctionId={auctionId}
        compareTo={AuctionStatus.LIVE}
        refetch={handleStatusChange}
      />
    );
  }

  if (!visible) return null;

  return (
    <>
      <CustomLink
        href={`/(tabs)/auctions/live/${auctionId ?? ''}`}
        mode='empty'
        style={hitboxStyle}
      >
        <Animated.View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      </CustomLink>
    </>
  );
};

const styles = StyleSheet.create({
  hitbox: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 9999,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: '#d75639',
  },
});
