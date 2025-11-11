import { View, Text } from 'react-native';
import { SelectField } from './SelectField';
import { cn } from '@/utils/cn';

type Option = { value: string; label: string };

// Discriminated union
type InputProps<Name extends string> = {
  id: Name;
  label: string;
  type: 'input';
  value: string;
  onChange: { value: string; options?: { name: Name } };
  className?: string;
};

type SelectProps<Name extends string> = {
  id: Name;
  label: string;
  type: 'select';
  value: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  options: Option[];
  className?: string;
};

type FilterFieldProps<Name extends string> =
  | InputProps<Name>
  | SelectProps<Name>;

export function FilterField<Name extends string>(
  props: FilterFieldProps<Name>
) {
  const { id, label, className } = props;

  if (props.type === 'input') {
    return (
      <View className={cn('w-full', className)}>
        <Text className='mb-1 text-base'>input {label}</Text>
        {/* <TextInput
          className='w-full rounded-lg border border-silver px-3 py-2 text-input-text'
          value={props.value}
          onChangeText={(txt) => props.onChange(txt, { name: id })}
          placeholder={label}
          placeholderTextColor='rgba(0,0,0,0.4)'
          /> */}
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
