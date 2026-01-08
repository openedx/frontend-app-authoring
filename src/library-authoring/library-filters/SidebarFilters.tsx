import {
  IconButton, Stack, useToggle,
} from '@openedx/paragon';
import {
  ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField,
} from '@src/search-manager';
import { FilterList } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useMultiLibraryContext } from '@src/library-authoring/common/context/MultiLibraryContext';
import { LibraryDropdownFilter } from './LibraryDropdownFilter';
import messages from './messages';
import { FiltersProps } from '.';
import { CollectionDropdownFilter } from './CollectionDropdownFilter';

export const SidebarFilters = ({ onlyOneType }: FiltersProps) => {
  const intl = useIntl();
  const [isOn,,, toggle] = useToggle(false);
  const { selectedCollections, setSelectedCollections } = useMultiLibraryContext();

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
        <CollectionDropdownFilter />
        <ClearFiltersButton
          onClear={() => setSelectedCollections([])}
          canClear={selectedCollections.length > 0}
        />
      </Stack>
      )}
    </Stack>
  );
};
