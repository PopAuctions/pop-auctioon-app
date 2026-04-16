import { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { Lang } from '@/types/types';

type DateInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  disabled?: boolean;
  minimumDate?: Date;
  title?: string;
};

const TEXTS: Record<Lang, { confirm: string; cancel: string }> = {
  es: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
  en: {
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
};

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

const parseDateValue = (value?: string | null) => {
  if (!value) return new Date();

  const parsed = new Date(`${value}T12:00:00`);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export function DateInputField<T extends FieldValues>({
  control,
  name,
  placeholder,
  disabled = false,
  minimumDate,
  title,
}: DateInputFieldProps<T>) {
  const { locale } = useTranslation();
  const defaultStyles = useDefaultStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | null>(null);

  const safeMinimumDate = useMemo(
    () => minimumDate ?? new Date(),
    [minimumDate]
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const selectedDate = parseDateValue(
          typeof value === 'string' ? value : ''
        );

        const handleOpen = () => {
          if (disabled) return;

          setDraftDate(selectedDate);
          setIsOpen(true);
        };

        const handleCancel = () => {
          setIsOpen(false);
          setDraftDate(null);
        };

        const handleConfirm = () => {
          if (draftDate) {
            onChange(formatDate(draftDate));
          }

          setIsOpen(false);
          setDraftDate(null);
        };

        return (
          <>
            <Pressable onPress={handleOpen}>
              <View pointerEvents='none'>
                <Input
                  value={typeof value === 'string' ? value : ''}
                  placeholder={placeholder}
                  editable={false}
                  className='opacity-100'
                />
              </View>
            </Pressable>

            <Modal
              visible={isOpen}
              transparent
              animationType='fade'
              onRequestClose={handleCancel}
            >
              <View className='flex-1 items-center justify-center bg-black/40 px-4'>
                <View className='w-full max-w-[420px] rounded-2xl bg-white p-4'>
                  {title ? (
                    <CustomText
                      type='subtitle'
                      className='mb-3 text-center'
                    >
                      {title}
                    </CustomText>
                  ) : null}

                  <DateTimePicker
                    mode='single'
                    date={draftDate ?? selectedDate}
                    minDate={safeMinimumDate}
                    onChange={({ date }) => {
                      if (date instanceof Date) {
                        setDraftDate(date);
                      }
                    }}
                    styles={defaultStyles}
                  />

                  <View className='mt-4 flex-row gap-3'>
                    <View className='flex-1'>
                      <Button
                        mode='secondary'
                        onPress={handleCancel}
                      >
                        {TEXTS[locale].cancel}
                      </Button>
                    </View>

                    <View className='flex-1'>
                      <Button
                        mode='primary'
                        onPress={handleConfirm}
                      >
                        {TEXTS[locale].confirm}
                        Confirm
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        );
      }}
    />
  );
}
