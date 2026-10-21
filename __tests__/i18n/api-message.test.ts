import { getApiMessageMetadata, resolveApiMessage } from '@/i18n/api-message';
import { SUPPORTED_LANGUAGES } from '@/i18n/locales';

const supportedLanguageKeys = [...SUPPORTED_LANGUAGES].sort();

describe('API message compatibility', () => {
  it('recognizes and translates the pending payment-session error', () => {
    const messageCode = 'errors.payment.confirmationPending';
    expect(getApiMessageMetadata({ messageCode })).toEqual({
      messageCode,
      messageParams: {},
    });

    const resolved = resolveApiMessage(
      { error: { en: 'legacy-en', es: 'legacy-es' }, messageCode },
      'error'
    );
    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
    expect(resolved?.en).toContain('5 minutes');
    expect(resolved?.es).toContain('5 minutos');
    expect(resolved?.ja).toContain('5分');
  });

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
    'store.updatedSuccessfully',
    'store.commissionUpdatedSuccessfully',
    'soldArticle.acquisitionCancelledSuccessfully',
    'soldArticle.sentToOnlineStoreSuccessfully',
    'soldArticle.emailSentSuccessfully',
    'soldArticle.grantedSuccessfully',
    'soldArticle.shippingUpdatedSuccessfully',
  ])('recognizes the typed web/app message contract for %s', (messageCode) => {
    expect(
      getApiMessageMetadata({ messageCode, messageParams: {} })
    ).toMatchObject({ messageCode, messageParams: {} });

    const resolved = resolveApiMessage(
      { success: { en: 'legacy-en', es: 'legacy-es' }, messageCode },
      'success'
    );
    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

      expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
  });

  it.each([
    'errors.store.notAuthorized',
    'errors.store.permissionDenied',
    'errors.store.userInvalid',
    'errors.store.userNotFound',
    'errors.store.auctioneerInactive',
    'errors.store.fieldsInvalid',
    'errors.store.socialUrlInvalid',
    'errors.store.webUrlInvalid',
    'errors.store.updateFailed',
    'errors.store.imageUploadFailed',
    'errors.store.userLoadFailed',
    'errors.store.notFound',
    'errors.store.loadFailed',
    'errors.store.dataLoadFailed',
    'errors.store.countryLoadFailed',
    'errors.store.articleIdRequired',
    'errors.store.articleIdInvalid',
    'errors.store.commissionLoadFailed',
    'errors.store.commissionInvalid',
    'errors.store.commissionUpdateFailed',
    'errors.soldArticle.userInvalid',
    'errors.soldArticle.notFound',
    'errors.soldArticle.loadFailed',
    'errors.soldArticle.listLoadFailed',
    'errors.soldArticle.auctionIdInvalid',
    'errors.soldArticle.articleIdInvalid',
    'errors.soldArticle.requestBodyInvalid',
    'errors.soldArticle.dataInvalid',
    'errors.soldArticle.acquisitionCancelFailed',
    'errors.soldArticle.acquisitionNotFound',
    'errors.soldArticle.ownerMismatch',
    'errors.soldArticle.alreadyPaid',
    'errors.soldArticle.cancelTooEarly',
    'errors.soldArticle.sendStoreFailed',
    'errors.soldArticle.sendStoreTooEarly',
    'errors.soldArticle.notifyEmailFailed',
    'errors.soldArticle.notSold',
    'errors.soldArticle.priceInvalid',
    'errors.soldArticle.notifyNotNeeded',
    'errors.soldArticle.grantFailed',
    'errors.soldArticle.alreadyGranted',
    'errors.soldArticle.grantTooEarly',
    'errors.soldArticle.notEnoughBids',
    'errors.soldArticle.firstUserInvalid',
    'errors.soldArticle.secondBidderInvalid',
    'errors.soldArticle.shippingNotAuthorized',
    'errors.soldArticle.shippingInfoInvalid',
    'errors.soldArticle.shippingUpdateFailed',
  ])('recognizes the store and sold-article contract for %s', (messageCode) => {
    const resolved = resolveApiMessage(
      {
        error: { en: 'legacy-en', es: 'legacy-es' },
        messageCode,
        messageParams: {},
      },
      'error'
    );

    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

      expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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

    expect(Object.keys(resolved ?? {}).sort()).toEqual(supportedLanguageKeys);
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
