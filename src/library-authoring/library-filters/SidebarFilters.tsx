import { Form, IconButton, Menu, SearchField, Stack, useToggle } from "@openedx/paragon"
import { FiltersProps } from "."
import { ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField, SearchSortWidget } from "@src/search-manager"
import SearchFilterWidget from "@src/search-manager/SearchFilterWidget"
import { FilterList, Newsstand } from "@openedx/paragon/icons"
import messages from './messages';
import { useIntl } from "@edx/frontend-platform/i18n"

export const SidebarFilters = ({onlyOneType}: FiltersProps) => {
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
              value={''}
              placeholder={''}
              className="mx-3 mb-1"
            />
            <Menu className="filter-by-refinement-menu" style={{ boxShadow: 'none' }}>
            </Menu>
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
      {isOn && <Stack direction="horizontal">
        <FilterByTags />
        {!(onlyOneType) && <FilterByBlockType />}
        <ClearFiltersButton />
        <SearchSortWidget />
      </Stack>}
    </Stack>
  )
}

