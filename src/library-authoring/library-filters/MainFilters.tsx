import { ActionRow } from "@openedx/paragon"
import LibraryFilterByPublished from "@src/library-authoring/generic/filter-by-published"
import { FiltersProps } from "."
import { useLibraryRoutes } from "@src/library-authoring/routes"
import { ClearFiltersButton, FilterByBlockType, FilterByTags, SearchKeywordsField, SearchSortWidget } from "@src/search-manager"

export const MainFilters = ({onlyOneType}: FiltersProps) => {
  const {
    insideCollections,
    insideUnits,
  } = useLibraryRoutes();

  return (
    <ActionRow className="my-3">
      <SearchKeywordsField className="mr-3" />
      <FilterByTags />
      {!(onlyOneType) && <FilterByBlockType />}
      <LibraryFilterByPublished key={
        // It is necessary to re-render `LibraryFilterByPublished` every time `FilterByBlockType`
        // appears or disappears, this is because when the menu is opened it is rendered
        // in a previous state, causing an inconsistency in its position.
        // By changing the key we can re-render the component.
        !(insideCollections || insideUnits) ? 'filter-published-1' : 'filter-published-2'
      }
      />
      <ClearFiltersButton />
      <ActionRow.Spacer />
      <SearchSortWidget />
    </ActionRow>
  )
}

