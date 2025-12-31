import {
  IconButton, Stack, useToggle,
} from '@openedx/paragon';
import {
  ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField, SearchSortWidget,
} from '@src/search-manager';
import { FilterList } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { FiltersProps } from '.';
import { LibraryDropdownFilter } from '@src/library-authoring/library-filters/LibraryDropdownFilter';

export const SidebarFilters = ({ onlyOneType }: FiltersProps) => {
  const intl = useIntl();
  const [isOn,,, toggle] = useToggle(false);

  return (
    <Stack gap={3} className="my-3">
      <Stack direction="horizontal" gap={1}>
        <LibraryDropdownFilter />
        <SearchKeywordsField />
        <IconButton
          onClick={toggle}
          alt={intl.formatMessage(messages.additionalFilterBtnAltText)}
          size="md"
          src={FilterList}
          className="rounded-sm border ml-2"
        />
      </Stack>
      {isOn && (
      <Stack direction="horizontal">
        {!(onlyOneType) && <FilterByBlockType />}
        <FilterByTags />
        <ClearFiltersButton />
        <SearchSortWidget />
      </Stack>
      )}
    </Stack>
  );
};
