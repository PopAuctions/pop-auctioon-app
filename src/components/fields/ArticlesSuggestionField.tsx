import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/utils/cn';
import { useFetchOnlineStoreArticlesSuggestions } from '@/hooks/components/useFetchOnlineStoreArticlesSuggestions';
import { SelectField } from './SelectField';

type ArticlesSuggestionFieldProps = {
  id: string;
  label: string;
  value: string;
  className?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
};

export function ArticlesSuggestionField({
  id,
  label,
  value,
  className,
  isClearable,
  isDisabled,
}: ArticlesSuggestionFieldProps) {
  const { getSecondChanceArticleSuggestions } =
    useFetchOnlineStoreArticlesSuggestions();
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [searchText, setSearchText] = useState('');

  const dropdownOptions = useMemo(() => {
    if (!value) return options;

    const selectedOptionExists = options.some(
      (option) => option.value === value
    );

    if (selectedOptionExists) return options;

    return [{ value, label: value }, ...options];
  }, [options, value]);
  useEffect(() => {
    const search = searchText.trim();

    if (search.length < 2) {
      setOptions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await getSecondChanceArticleSuggestions({ search });

      setOptions(
        (results ?? []).map((suggestion) => ({
          value: suggestion,
          label: suggestion,
        }))
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText, getSecondChanceArticleSuggestions]);

  return (
    <View className={cn('w-full', className)}>
      <Text className='mb-1 text-base'>{label}</Text>

      <SelectField
        name={id}
        value={value || null}
        options={dropdownOptions}
        isSearchable
        isClearable={isClearable}
        isDisabled={isDisabled}
        placeholder={label}
        onSearchChange={setSearchText}
      />
    </View>
  );
}
