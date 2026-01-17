import { View, Switch } from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { CustomText } from '@/components/ui/CustomText';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/form-errors';
import { AuctionCategories, AuctionCategoriesConst } from '@/types/types';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { SelectField } from '../fields/SelectField';
import {
  ART_TYPES,
  ARTICLE_BRANDS,
  ARTICLE_COLORS,
  ARTICLE_MATERIALS,
  ARTICLE_SMELL,
  BOX_MATERIALS,
  STRAP_MATERIALS,
  WATCH_MOVEMENTS,
} from '@/constants';
import { Tooltip } from '../ui/Tooltip';

interface ArticleExtraFieldsProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  auctionCategory: AuctionCategories;
  isLoading: boolean;
  auctionView?: boolean;
}

export const ArticleExtraFields = ({
  control,
  errors,
  auctionCategory,
  isLoading,
  auctionView = true,
}: ArticleExtraFieldsProps) => {
  const { t, locale } = useTranslation();
  const isBags = auctionCategory === AuctionCategoriesConst.BAGS;
  const isJewelry = auctionCategory === AuctionCategoriesConst.JEWERLY;
  const isWatches = auctionCategory === AuctionCategoriesConst.WATCHES;
  const isArt = auctionCategory === AuctionCategoriesConst.ART;

  return (
    <>
      {/* RESERVE PRICE */}
      {auctionView && (
        <View className='mb-4'>
          <View className='flex flex-row gap-2'>
            <Tooltip content={t('screens.newArticle.reservePriceTooltip')} />
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.reservePrice')}
            </CustomText>
          </View>
          <Controller
            control={control}
            name='reservePrice'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('screens.newArticle.reservePrice')}
                keyboardType='number-pad'
                editable={!isLoading}
              />
            )}
          />
          {errors.reservePrice && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.reservePrice?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}
        </View>
      )}

      {/* MATERIAL (BAGS / JEWELRY)  / ART TYPE (ART) */}
      {(isBags || isJewelry) && (
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.material')}*
          </CustomText>
          <Controller
            control={control}
            name='material'
            render={({ field: { value, onChange } }) => (
              <SelectField
                name='material'
                value={value ?? null}
                options={ARTICLE_MATERIALS[locale]}
                placeholder={t('screens.newArticle.material')}
                isSearchable={true}
                isDisabled={isLoading}
                formField={true}
                isClearable={true}
                onChange={onChange}
              />
            )}
          />
          {errors.material && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.material?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}
        </View>
      )}

      {isArt && (
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.artType')}*
          </CustomText>
          <Controller
            control={control}
            name='artType'
            render={({ field: { onChange, onBlur, value } }) => (
              <SelectField
                name='artType'
                value={value ?? null}
                options={ART_TYPES[locale]}
                placeholder={t('screens.newArticle.artType')}
                isSearchable={true}
                isDisabled={isLoading}
                formField={true}
                isClearable={true}
                onChange={onChange}
              />
            )}
          />
          {errors.artType && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.artType?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}
        </View>
      )}

      {/* BRAND + COLOR (BAGS / JEWELRY / WATCHES) */}
      {(isBags || isJewelry || isWatches) && (
        <View className='mb-4'>
          {/* Brand */}
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.brand')}*
          </CustomText>
          <Controller
            control={control}
            name='brand'
            render={({ field: { onChange, onBlur, value } }) => (
              <SelectField
                name='brand'
                value={value ?? null}
                options={ARTICLE_BRANDS}
                placeholder={t('screens.newArticle.brand')}
                isSearchable={true}
                isDisabled={isLoading}
                formField={true}
                isClearable={true}
                onChange={onChange}
              />
            )}
          />
          {errors.brand && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.brand?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}

          {/* Color */}
          <View className='mt-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.color')}
            </CustomText>
            <Controller
              control={control}
              name='color'
              render={({ field: { onChange, onBlur, value } }) => (
                <SelectField
                  name='color'
                  value={value ?? null}
                  options={ARTICLE_COLORS[locale]}
                  placeholder={t('screens.newArticle.color')}
                  isSearchable={true}
                  isDisabled={isLoading}
                  formField={true}
                  isClearable={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.color && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.color?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>
        </View>
      )}

      {/* WATCHES ONLY: faceDiameter, movement, strapMaterial, boxMaterial, year */}
      {isWatches && (
        <>
          {/* faceDiameter */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.faceDiameter')}
            </CustomText>
            <Controller
              control={control}
              name='faceDiameter'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.faceDiameter')}
                  keyboardType='decimal-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.faceDiameter && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.faceDiameter?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* movement */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.movement')}
            </CustomText>
            <Controller
              control={control}
              name='movement'
              render={({ field: { onChange, onBlur, value } }) => (
                <SelectField
                  name='movement'
                  value={value ?? null}
                  options={WATCH_MOVEMENTS[locale]}
                  placeholder={t('screens.newArticle.movement')}
                  isSearchable={true}
                  isDisabled={isLoading}
                  formField={true}
                  isClearable={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.movement && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.movement?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* strapMaterial */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.strapMaterial')}
            </CustomText>
            <Controller
              control={control}
              name='strapMaterial'
              render={({ field: { onChange, onBlur, value } }) => (
                <SelectField
                  name='strapMaterial'
                  value={value ?? null}
                  options={STRAP_MATERIALS[locale]}
                  placeholder={t('screens.newArticle.strapMaterial')}
                  isSearchable={true}
                  isDisabled={isLoading}
                  formField={true}
                  isClearable={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.strapMaterial && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.strapMaterial?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* boxMaterial */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.boxMaterial')}
            </CustomText>
            <Controller
              control={control}
              name='boxMaterial'
              render={({ field: { onChange, onBlur, value } }) => (
                <SelectField
                  name='boxMaterial'
                  value={value ?? null}
                  options={BOX_MATERIALS[locale]}
                  placeholder={t('screens.newArticle.boxMaterial')}
                  isSearchable={true}
                  isDisabled={isLoading}
                  formField={true}
                  isClearable={true}
                  onChange={onChange}
                />
              )}
            />
            {errors.boxMaterial && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.boxMaterial?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* year */}
          <View className='mb-4'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.year')}
            </CustomText>
            <Controller
              control={control}
              name='year'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.year')}
                  keyboardType='number-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.year && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.year?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>
        </>
      )}

      {/* BAGS: smell */}
      {isBags && (
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.smell')}*
          </CustomText>
          <Controller
            control={control}
            name='smell'
            render={({ field: { onChange, onBlur, value } }) => (
              <SelectField
                name='smell'
                value={value ?? null}
                options={ARTICLE_SMELL[locale]}
                placeholder={t('screens.newArticle.smell')}
                isSearchable={true}
                isDisabled={isLoading}
                formField={true}
                isClearable={true}
                onChange={onChange}
              />
            )}
          />
          {errors.smell && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.smell?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}
        </View>
      )}

      {/* ART: weight */}
      {isArt && (
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.weight')}
          </CustomText>
          <Controller
            control={control}
            name='weight'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('screens.newArticle.weight')}
                keyboardType='number-pad'
                editable={!isLoading}
              />
            )}
          />
          {errors.weight && (
            <CustomText
              type='error'
              className='mt-1'
            >
              {getErrorMessage(
                errors.weight?.message as string | undefined,
                locale
              )}
            </CustomText>
          )}
        </View>
      )}

      {/* JEWELRY: size */}
      {isJewelry && (
        <View className='mb-4'>
          <CustomText
            type='body'
            className='mb-2'
          >
            {t('screens.newArticle.size')}
          </CustomText>
          <Controller
            control={control}
            name='size'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('screens.newArticle.size')}
                keyboardType='number-pad'
                editable={!isLoading}
              />
            )}
          />
        </View>
      )}

      {/* CODE NUMBER (all) */}
      <View className='mb-4'>
        <CustomText
          type='body'
          className='mb-2'
        >
          {t('screens.newArticle.codeNumber')}
        </CustomText>
        <Controller
          control={control}
          name='codeNumber'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('screens.newArticle.codeNumber')}
              editable={!isLoading}
            />
          )}
        />
        {errors.codeNumber && (
          <CustomText
            type='error'
            className='mt-1'
          >
            {getErrorMessage(
              errors.codeNumber?.message as string | undefined,
              locale
            )}
          </CustomText>
        )}
      </View>

      {/* DOCUMENTATION / BOX (JEWELRY & WATCHES) */}
      {(isJewelry || isWatches) && (
        <View className='mb-4'>
          {/* documentation */}
          <View className='mb-3 flex-row items-center gap-3'>
            <Controller
              control={control}
              name='documentation'
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={!!value}
                  onValueChange={onChange}
                  disabled={isLoading}
                  trackColor={{
                    false: '#ccc',
                    true: '#d75639',
                  }}
                />
              )}
            />
            <CustomText type='body'>
              {t('screens.newArticle.documentation')}
            </CustomText>
          </View>

          {/* box (only watches) */}
          {isWatches && (
            <View className='flex-row items-center gap-3'>
              <Controller
                control={control}
                name='box'
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={!!value}
                    onValueChange={onChange}
                    disabled={isLoading}
                    trackColor={{
                      false: '#ccc',
                      true: '#d75639',
                    }}
                  />
                )}
              />
              <CustomText type='body'>{t('screens.newArticle.box')}</CustomText>
            </View>
          )}
        </View>
      )}

      {/* MEASURES (BAGS / ART): width, height, length */}
      {(isBags || isArt) && (
        <View className='mb-4'>
          <CustomText
            type='subtitle'
            className='mb-2 text-center'
          >
            {t('screens.newArticle.measures')}
          </CustomText>

          {/* width */}
          <View className='mb-3'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.width')}
            </CustomText>
            <Controller
              control={control}
              name='width'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.width')}
                  keyboardType='decimal-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.width && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.width?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* height */}
          <View className='mb-3'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.height')}
            </CustomText>
            <Controller
              control={control}
              name='height'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.height')}
                  keyboardType='decimal-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.height && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.height?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>

          {/* length */}
          <View className='mb-1'>
            <CustomText
              type='body'
              className='mb-2'
            >
              {t('screens.newArticle.length')}
            </CustomText>
            <Controller
              control={control}
              name='length'
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('screens.newArticle.length')}
                  keyboardType='decimal-pad'
                  editable={!isLoading}
                />
              )}
            />
            {errors.length && (
              <CustomText
                type='error'
                className='mt-1'
              >
                {getErrorMessage(
                  errors.length?.message as string | undefined,
                  locale
                )}
              </CustomText>
            )}
          </View>
        </View>
      )}

      {/* OBSERVATIONS */}
      <View className='mb-6'>
        <CustomText
          type='body'
          className='mb-2'
        >
          {t('screens.newArticle.observations')}
        </CustomText>
        <Controller
          control={control}
          name='observations'
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('screens.newArticle.observations')}
              editable={!isLoading}
              multiline
              numberOfLines={3}
              textAlignVertical='top'
              className='h-20'
            />
          )}
        />
        {errors.observations && (
          <CustomText
            type='error'
            className='mt-1'
          >
            {getErrorMessage(
              errors.observations?.message as string | undefined,
              locale
            )}
          </CustomText>
        )}
      </View>
    </>
  );
};
