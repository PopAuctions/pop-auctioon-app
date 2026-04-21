import { useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import DateTimePicker, {
  useDefaultClassNames,
} from 'react-native-ui-datepicker';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CustomText } from '@/components/ui/CustomText';

type TimeInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  disabled?: boolean;
  title?: string;
};

const formatTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${hh}:${mm}`;
};

const parseTimeValue = (value?: string | null) => {
  if (!value) return new Date();

  const parsed = new Date(`2000-01-01T${value}:00`);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export function TimeInputField<T extends FieldValues>({
  control,
  name,
  placeholder,
  disabled = false,
  title,
}: TimeInputFieldProps<T>) {
  const defaultClassNames = useDefaultClassNames();
  const [isOpen, setIsOpen] = useState(false);
  const [draftTime, setDraftTime] = useState<Date | null>(null);

  const pickerClassNames = useMemo(
    () => ({
      ...defaultClassNames,
      time_label: 'text-black',
      // time_selector: cn(defaultClassNames.time_selector, 'text-cinnabar'),
      // time_selector_label: cn(
      //   defaultClassNames.time_selector_label,
      //   'text-cinnabar font-semibold'
      // ),
      time_selected_indicator:
        'bg-orange-200 border border-cinnabar rounded-xl',
    }),

    [defaultClassNames]
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const selectedTime = parseTimeValue(
          typeof value === 'string' ? value : ''
        );

        const handleOpen = () => {
          if (disabled) return;

          setDraftTime(selectedTime);
          setIsOpen(true);
        };

        const handleCancel = () => {
          setIsOpen(false);
          setDraftTime(null);
        };

        const handleConfirm = () => {
          if (draftTime) {
            onChange(formatTime(draftTime));
          }

          setIsOpen(false);
          setDraftTime(null);
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
                    date={draftTime ?? selectedTime}
                    disableMonthPicker
                    disableYearPicker
                    hideHeader
                    timePicker
                    initialView='time'
                    onChange={({ date }) => {
                      if (date instanceof Date) {
                        setDraftTime(date);
                      }
                    }}
                    classNames={pickerClassNames}
                  />

                  <View className='mt-4 flex-row gap-3'>
                    <View className='flex-1'>
                      <Button
                        mode='secondary'
                        onPress={handleCancel}
                      >
                        Cancel
                      </Button>
                    </View>

                    <View className='flex-1'>
                      <Button
                        mode='primary'
                        onPress={handleConfirm}
                      >
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
