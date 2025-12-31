import { useIntl } from "@edx/frontend-platform/i18n";
import { Form, Menu, MenuItem, SearchField } from "@openedx/paragon";
import { Newsstand } from "@openedx/paragon/icons";
import { useContentLibraryV2List } from "@src/library-authoring/data/apiHooks";
import SearchFilterWidget from "@src/search-manager/SearchFilterWidget"
import { useState } from "react";
import messages from './messages';

export const LibraryDropdownFilter = () => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const {
    data,
    isPending,
    isError,
  } = useContentLibraryV2List({ pagination: false, search });

  const libraryMenuItems = data?.map((library) => (
    <MenuItem
      key={library.id}
      as={Form.Checkbox}
      value={library.id}
      onChange={() => {}}
    >
      <div>
        {library.title}
      </div>
    </MenuItem>
  ));

  return (
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
          onChange={setSearch}
          onClear={() => setSearch('')}
          value={search}
          placeholder=""
          className="mx-3 mb-1"
        />
        <Menu className="filter-by-refinement-menu" style={{ boxShadow: 'none' }}>
          {libraryMenuItems}
        </Menu>
      </Form.Group>
    </SearchFilterWidget>
  )
}

