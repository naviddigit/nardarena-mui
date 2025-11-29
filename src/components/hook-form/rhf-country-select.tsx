import type { UseControllerProps } from 'react-hook-form';

import { Controller, useFormContext } from 'react-hook-form';

import type { CountrySelectProps } from 'src/components/country-select';
import { CountrySelect } from 'src/components/country-select';

// ----------------------------------------------------------------------

type Props = CountrySelectProps & UseControllerProps<any>;

export function RHFCountrySelect({ name, helperText, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <CountrySelect
          {...field}
          onChange={(event, newValue) => field.onChange(newValue)}
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
}
