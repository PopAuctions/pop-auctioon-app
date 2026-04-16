import { View, Text } from 'react-native';
import { SelectField } from './SelectField';
import { cn } from '@/utils/cn';
import { TextField } from './InputField';

type Option = { value: string; label: string };

// Discriminated union
type InputProps = {
  id: string;
  label: string;
  type: 'input';
  value: string;
  className?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
};

type SelectProps = {
  id: string;
  label: string;
  type: 'select';
  value: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  options: Option[];
  className?: string;
};

type FilterFieldProps = InputProps | SelectProps;

export function FilterField(props: FilterFieldProps) {
  const { id, label, className } = props;

  if (props.type === 'input') {
    return (
      <View className={cn('w-full', className)}>
        <Text className='mb-1 text-base'>{label}</Text>
        <TextField
          name={id}
          value={props.value}
          placeholder={label}
          isClearable={props.isClearable}
          isDisabled={props.isDisabled}
        />
      </View>
    );
  }

  return (
    <View className={cn('w-full', className)}>
      <Text className='mb-1 text-base'>{label}</Text>

      <SelectField
        name={id}
        value={props.value || null}
        options={props.options}
        isSearchable={props.isSearchable}
        isClearable={props.isClearable}
        placeholder={label}
      />
    </View>
  );
}
