import {
  IconButton,
  Stack,
  useToggle,
} from '@openedx/paragon';
import {
  ClearFiltersButton,
  FilterByBlockType,
  FilterByTags,
  SearchKeywordsField,
  useSearchContext,
} from '@src/search-manager';
import { FilterList } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { useMultiLibraryContext } from '@src/library-authoring/common/context/MultiLibraryContext';
import { LibraryDropdownFilter } from './LibraryDropdownFilter';
import messages from './messages';
import { FiltersProps } from '.';
import { CollectionDropdownFilter } from './CollectionDropdownFilter';

export const SidebarFilters = ({ onlyOneType }: FiltersProps) => {
  const intl = useIntl();
  const [isOn, , , toggle] = useToggle(false);
  const { selectedCollections, setSelectedCollections } = useMultiLibraryContext();
  const { totalHits } = useSearchContext();

  return (
    <Stack gap={3} className="my-3">
      <Stack className="flex-wrap" direction="horizontal" gap={2}>
        <LibraryDropdownFilter />
        <Stack direction="horizontal" gap={1}>
          <SearchKeywordsField />
          <IconButton
            onClick={toggle}
            alt={intl.formatMessage(messages.additionalFilterBtnAltText)}
            size="md"
            src={FilterList}
            className="rounded-sm border ml-2"
          />
        </Stack>
      </Stack>
      {isOn && (
        <Stack className="flex-wrap" direction="horizontal" gap={2}>
          {!onlyOneType && <FilterByBlockType />}
          <FilterByTags />
          <CollectionDropdownFilter />
          <ClearFiltersButton
            onClear={() => setSelectedCollections([])}
            canClear={selectedCollections.length > 0}
          />
        </Stack>
      )}
      <div>
        <FormattedMessage {...messages.contentBlocksCount} values={{
          count: totalHits,
        }}/>
      </div>
    </Stack>
  );
};
