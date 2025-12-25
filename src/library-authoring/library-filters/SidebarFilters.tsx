import { Form, Menu, SearchField, Stack } from "@openedx/paragon"
import { FiltersProps } from "."
import { ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField, SearchSortWidget } from "@src/search-manager"
import SearchFilterWidget from "@src/search-manager/SearchFilterWidget"
import { Newsstand } from "@openedx/paragon/icons"

export const SidebarFilters = ({onlyOneType}: FiltersProps) => {

  return (
    <Stack gap={3} className="my-3">
      <Stack direction="horizontal">
        <SearchFilterWidget
          appliedFilters={[]}
          label={'All libraries'}
          clearFilter={() => {}}
          icon={Newsstand}
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
      </Stack>
      <Stack direction="horizontal">
        <FilterByTags />
        {!(onlyOneType) && <FilterByBlockType />}
        <ClearFiltersButton />
        <SearchSortWidget />
      </Stack>
    </Stack>
  )
}

