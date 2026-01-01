import {
  Form, IconButton, Menu, SearchField, Stack, useToggle,
} from '@openedx/paragon';
import {
  ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField, SearchSortWidget,
} from '@src/search-manager';
import SearchFilterWidget from '@src/search-manager/SearchFilterWidget';
import { FilterList, Newsstand } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { FiltersProps } from '.';

export const SidebarFilters = ({ onlyOneType }: FiltersProps) => {
  const intl = useIntl();
  const [isOn,,, toggle] = useToggle(false);

  return (
    <Stack gap={3} className="my-3">
      <Stack direction="horizontal" gap={1}>
        <SearchFilterWidget
          appliedFilters={[]}
          label={intl.formatMessage(messages.librariesFilterBtnText)}
          clearFilter={() => {}}
          icon={Newsstand}
          btnSize="md"
        >
          <Form.Group className="pt-3 mb-0">
            <SearchField
              onSubmit={() => {}}
              onChange={() => {}}
              onClear={() => {}}
              value=""
              placeholder=""
              className="mx-3 mb-1"
            />
            <Menu className="filter-by-refinement-menu" style={{ boxShadow: 'none' }} />
          </Form.Group>
        </SearchFilterWidget>
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
