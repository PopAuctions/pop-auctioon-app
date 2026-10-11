import { getApiMessageMetadata, resolveApiMessage } from '@/i18n/api-message';

describe('API message compatibility', () => {
  it('accepts known codes and defaults missing parameters to an empty object', () => {
    expect(
      getApiMessageMetadata({
        messageCode: 'common.toast.success',
      })
    ).toEqual({
      messageCode: 'common.toast.success',
      messageParams: {},
    });
  });

  it.each([
    'article.followedSuccessfully',
    'article.unfollowedSuccessfully',
    'article.removedFromAuctionSuccessfully',
    'auction.followedSuccessfully',
    'auction.unfollowedSuccessfully',
    'auction.finished',
    'liveAuction.articleChangedSuccessfully',
    'autoBid.deactivatedSuccessfully',
    'auction.reviewRequestedSuccessfully',
    'article.wonArticlesRemovedSuccessfully',
    'article.imageOrderUpdatedSuccessfully',
    'article.orderUpdatedSuccessfully',
    'article.refreshedSuccessfully',
    'article.onlineStoreCreatedSuccessfully',
    'article.onlineStoreDeletedSuccessfully',
    'article.onlineStorePriceUpdatedSuccessfully',
    'article.onlineStoreEnabledSuccessfully',
    'article.onlineStoreAssignedSuccessfully',
    'offer.madeSuccessfully',
    'offer.acceptedSuccessfully',
    'offer.rejectedSuccessfully',
    'offer.counterSentSuccessfully',
    'offer.counterAcceptedSuccessfully',
    'offer.counterRejectedSuccessfully',
  ])('recognizes the typed web/app message contract for %s', (messageCode) => {
    expect(
      getApiMessageMetadata({ messageCode, messageParams: {} })
    ).toMatchObject({ messageCode, messageParams: {} });

    const resolved = resolveApiMessage(
      { success: { en: 'legacy-en', es: 'legacy-es' }, messageCode },
      'success'
    );
    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
  });

  it('uses the legacy map when the message code is unknown', () => {
    const legacy = { en: 'legacy-en', es: 'legacy-es' };

    expect(
      resolveApiMessage(
        {
          error: legacy,
          messageCode: 'unknown.message.code',
          messageParams: {},
        },
        'error'
      )
    ).toEqual(legacy);
  });

  it('recognizes the online-store list error contract by structure', () => {
    const resolved = resolveApiMessage(
      {
        error: { en: 'legacy-en', es: 'legacy-es' },
        messageCode: 'errors.article.onlineStoreListLoadFailed',
        messageParams: {},
      },
      'error'
    );

    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
  });

  it.each([
    'errors.article.onlineStoreDetailQueryFailed',
    'errors.article.onlineStoreDetailNotFound',
    'errors.article.onlineStoreDetailLoadFailed',
  ])(
    'recognizes the online-store detail error contract for %s',
    (messageCode) => {
      const resolved = resolveApiMessage(
        {
          error: { en: 'legacy-en', es: 'legacy-es' },
          messageCode,
          messageParams: {},
        },
        'error'
      );

      expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
    }
  );

  it.each([
    'errors.offer.unauthorized',
    'errors.offer.invalid',
    'errors.offer.notFound',
    'errors.offer.articleUnavailable',
    'errors.offer.articleUnavailableNoArticle',
    'errors.offer.inactive',
    'errors.offer.unavailable',
    'errors.offer.negotiationInactive',
    'errors.offer.negotiationUnavailable',
    'errors.offer.negotiationUnavailableShort',
    'errors.offer.alreadyUpdated',
    'errors.offer.alreadyUpdatedStore',
    'errors.offer.acceptFailed',
    'errors.offer.notReadyAccept',
    'errors.offer.counterAcceptFailed',
    'errors.offer.noCounterAccept',
    'errors.offer.counterNotFoundSupport',
    'errors.offer.counterUnavailableSupport',
    'errors.offer.counterInfoInvalid',
    'errors.offer.counterLoadFailed',
    'errors.offer.noCounterResponse',
    'errors.offer.currentCounterNotFound',
    'errors.offer.waitStore',
    'errors.offer.userCounterSame',
    'errors.offer.userCounterSendFailed',
    'errors.offer.storeCounterLoadFailed',
    'errors.offer.currentProposalNotFound',
    'errors.offer.waitBuyer',
    'errors.offer.storeCounterSame',
    'errors.offer.storeCounterSendFailed',
    'errors.offer.rejectFailed',
    'errors.offer.notReadyReject',
    'errors.offer.counterRejectFailed',
    'errors.offer.noCounterReject',
    'errors.offer.counterNotFound',
    'errors.offer.counterUnavailable',
    'errors.offer.myListUserMissing',
    'errors.offer.myListLoadFailed',
    'errors.offer.latestListUserInvalid',
    'errors.offer.latestListLoadFailed',
    'errors.offer.makeAuthRequired',
    'errors.offer.reviewAccount',
    'errors.offer.phoneRequired',
    'errors.offer.articleIdInvalid',
    'errors.offer.amountInvalid',
    'errors.offer.makeFailed',
    'errors.offer.makeArticleUnavailable',
    'errors.offer.ownArticle',
    'errors.offer.minAmount',
    'errors.offer.activeExists',
    'errors.offer.acceptedActiveExists',
  ])('recognizes the offer contract for %s', (messageCode) => {
    const resolved = resolveApiMessage(
      {
        error: { en: 'legacy-en', es: 'legacy-es' },
        messageCode,
        messageParams: {},
      },
      'error'
    );

    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
  });

  it.each([
    'errors.onlineStoreArticle.userInvalid',
    'errors.onlineStoreArticle.ownerMismatch',
    'errors.onlineStoreArticle.createCategoryInvalid',
    'errors.onlineStoreArticle.createFieldsInvalid',
    'errors.onlineStoreArticle.createMaxImages',
    'errors.onlineStoreArticle.createMinImages',
    'errors.onlineStoreArticle.formMinImages',
    'errors.onlineStoreArticle.createFailed',
    'errors.onlineStoreArticle.listLoadFailed',
    'errors.onlineStoreArticle.imageUserMissing',
    'errors.onlineStoreArticle.imageLoadFailed',
    'errors.onlineStoreArticle.imageNotFound',
    'errors.onlineStoreArticle.imageSold',
    'errors.onlineStoreArticle.imageUpdateFailed',
    'errors.onlineStoreArticle.ownershipUserMissing',
    'errors.onlineStoreArticle.ownershipRequestFailed',
    'errors.onlineStoreArticle.ownershipNotFound',
    'errors.onlineStoreArticle.layoutLoadFailed',
    'errors.onlineStoreArticle.layoutNotFound',
    'errors.onlineStoreArticle.deleteFailed',
    'errors.onlineStoreArticle.deleteSold',
    'errors.onlineStoreArticle.priceUpdateFailed',
    'errors.onlineStoreArticle.priceActiveOffers',
    'errors.onlineStoreArticle.pricePendingOffers',
    'errors.onlineStoreArticle.priceStatusInvalid',
    'errors.onlineStoreArticle.enableFailed',
    'errors.onlineStoreArticle.alreadyAvailable',
    'errors.onlineStoreArticle.assignAuctionIdInvalid',
    'errors.onlineStoreArticle.assignEstimatedPriceInvalid',
    'errors.onlineStoreArticle.assignStartingPriceInvalid',
    'errors.onlineStoreArticle.assignFailed',
    'errors.onlineStoreArticle.assignSold',
    'errors.onlineStoreArticle.assignActiveOffer',
    'errors.onlineStoreArticle.assignAuctionNotFound',
    'errors.onlineStoreArticle.assignAuctionOwnerMismatch',
    'errors.onlineStoreArticle.assignTooLate',
    'errors.onlineStoreArticle.assignAlreadyAssigned',
    'errors.onlineStoreArticle.assignCategoryMismatch',
    'errors.onlineStoreArticle.noImageSelected',
    'errors.onlineStoreArticle.imageMaximum',
    'errors.onlineStoreArticle.imageUploadFailed',
    'errors.onlineStoreArticle.modelRequired',
    'errors.onlineStoreArticle.imageRemoveFailed',
    'errors.onlineStoreArticle.createUnexpected',
    'errors.onlineStoreArticle.imageRequired',
    'errors.onlineStoreArticle.updateFailed',
  ])('recognizes the online-store article contract for %s', (messageCode) => {
    const resolved = resolveApiMessage(
      {
        error: { en: 'legacy-en', es: 'legacy-es' },
        messageCode,
        messageParams: {},
      },
      'error'
    );

    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
  });

  it.each([
    'errors.article.myOnlineStoreDetailUserInvalid',
    'errors.article.myOnlineStoreDetailArticleInvalid',
    'errors.article.myOnlineStoreDetailLoadFailed',
    'errors.article.myOnlineStoreDetailNotFound',
  ])(
    'recognizes the seller article-detail error contract for %s',
    (messageCode) => {
      const resolved = resolveApiMessage(
        {
          error: { en: 'legacy-en', es: 'legacy-es' },
          messageCode,
          messageParams: {},
        },
        'error'
      );

      expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
    }
  );

  it('uses the legacy map when message parameters are malformed', () => {
    const legacy = { en: 'legacy-en', es: 'legacy-es' };

    expect(
      resolveApiMessage(
        {
          error: legacy,
          messageCode: 'validation.usernameMinLength',
          messageParams: { min: null },
        },
        'error'
      )
    ).toEqual(legacy);
  });

  it('keeps legacy string errors compatible with every supported locale', () => {
    const resolved = resolveApiMessage({ error: 'legacy' }, 'error');

    expect(Object.keys(resolved ?? {}).sort()).toEqual(['en', 'es']);
    expect(new Set(Object.values(resolved ?? {}))).toEqual(new Set(['legacy']));
  });

  it('preserves a null message field instead of manufacturing a message', () => {
    expect(
      resolveApiMessage(
        {
          success: null,
          messageCode: 'common.toast.success',
          messageParams: {},
        },
        'success'
      )
    ).toBeUndefined();
  });
});
