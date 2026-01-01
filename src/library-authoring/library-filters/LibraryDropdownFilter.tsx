import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";
import { ButtonGroup, Dropdown, Form, OverlayTrigger, Scrollable, SearchField, Tooltip } from "@openedx/paragon";
import { Newsstand } from "@openedx/paragon/icons";
import Loading from "@src/generic/Loading";
import { useLibraryContext } from "@src/library-authoring/common/context/LibraryContext";
import { ContentLibrary } from "@src/library-authoring/data/api";
import { useContentLibraryV2List } from "@src/library-authoring/data/apiHooks";
import { debounce, truncate } from "lodash";
import { useCallback, useEffect, useState } from "react";
import messages from './messages';

interface LibraryItemsProps {
  isPending: boolean;
  data?: ContentLibrary[];
  onChange: (id: string) => void;
}

const LibraryItems = ({ isPending, data, onChange }: LibraryItemsProps) => {
  if (isPending) {
    return <Loading />
  }

  if (!data ||data.length === 0) {
    return <span className="p-3">
    <FormattedMessage {...messages.librariesFilterBtnEmpty} />
    </span>
  }

  return (
    <Scrollable
      className="m-0 p-0"
      style={{'max-height': '25vh'}}
    >
      {data?.map((library) => (
        <Dropdown.Item
          key={library.id}
          as={Form.Checkbox}
          value={library.id}
          onChange={() => onChange(library.id)}
          className="py-2 my-1 overflow-auto"
        >
          <div>
            {truncate(library.title, { length: 50})}
          </div>
        </Dropdown.Item>
      ))}
    </Scrollable>
  );
}

export const LibraryDropdownFilter = () => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const {selectedLibraries, setSelectedLibraries} = useLibraryContext(false);
  const [label, setLabel] = useState(intl.formatMessage(messages.librariesFilterBtnText));
  const { isPending, data } = useContentLibraryV2List({ pagination: false, search });

  const handleSearch = useCallback(
    // Perform search after 500ms
    debounce((term) => setSearch(term.trim()), 500),
    [setSearch],
  );

  const onChange = (libraryId: string) => {
    setSelectedLibraries((prev) => {
      if (prev.includes(libraryId)) {
        return prev.filter((id) => id !== libraryId);
      } else {
        return [...prev, libraryId];
      }
    });
  }

  useEffect(() => {
    const baseName = intl.formatMessage(messages.librariesFilterBtnText)
    if (!selectedLibraries.length) {
      setLabel(baseName);
    } else if (selectedLibraries.length === 1) {
      setLabel(data?.find((lib) => lib.id === selectedLibraries[0])?.title || baseName);
    } else if (selectedLibraries.length > 1) {
      setLabel(`${selectedLibraries.length} Libraries`);
    }
  }, [label, selectedLibraries, data])

  return (
    <Dropdown
      as={ButtonGroup}
      autoClose="outside"
    >
      <OverlayTrigger
        placement='auto'
        overlay={
          <Tooltip variant="light" id='library-filter-tooltip'>
            {label}
          </Tooltip>
        }
      >
        <Dropdown.Toggle
          iconBefore={Newsstand}
          className="text-overflow text-primary-500 p-2 px-4 mr-2"
        >
          {truncate(label, { length: 30})}
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu className="my-1">
        <SearchField
          onSubmit={handleSearch}
          onChange={handleSearch}
          onClear={() => setSearch('')}
          value={search}
          placeholder={intl.formatMessage(messages.librariesFilterBtnPlaceholder)}
          className="mx-1 border-0"
        />
        <Dropdown.Divider className="mb-0" />
        <LibraryItems isPending={isPending} data={data} onChange={onChange}/>
      </Dropdown.Menu>
    </Dropdown>
  )
}

