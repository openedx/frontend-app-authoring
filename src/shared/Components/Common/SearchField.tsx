import { SearchField } from '@openedx/paragon';
import React from 'react';
import { cn } from 'shared/lib/utils';
import { SearchLg, X } from '@untitledui/icons';
import { Spinner } from '../ui/shadcn-io/spinner';

interface Props {
  onSubmit: (value: string) => void;
  onChange: (value: string) => void;
  value: string;
  className?: string;
  isLoading?: boolean;
}

const SearchFieldWrapper = ({
  onSubmit, onChange, value, className, isLoading,
}:Props) => (
  <SearchField.Advanced
    onSubmit={onSubmit}
    onChange={onChange}
    value={value}
    className={cn(
      'tw-bg-white tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full',
      'tw-rounded-[100px] tw-px-3 tw-py-2',
      'tw-border tw-border-gray-300 tw-shadow-xs tw-border-solid',
      'after:tw-hidden',
      className,
    )}
    data-testid="input-filter-courses-search"
    icons={{
      submit: SearchLg,
      clear: X,
    }}
  >
    <SearchField.ClearButton className="tw-text-gray-500 tw-w-5 tw-h-5 focus:!tw-shadow-none hover:!tw-bg-transparent" />
    <SearchField.SubmitButton className="tw-text-gray-500 tw-w-5 tw-h-5 focus:!tw-shadow-none hover:!tw-bg-transparent" />
    <SearchField.Input placeholder="Search" className="tw-text-md tw-font-normal tw-text-gray-500" />
    <div className="tw-flex tw-items-center tw-justify-center" data-testid="loading-search-spinner">
      {isLoading && <Spinner />}
    </div>
  </SearchField.Advanced>
);

export default SearchFieldWrapper;
