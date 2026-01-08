import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  ButtonGroup, Dropdown, Form, OverlayTrigger, Scrollable, SearchField, Tooltip,
} from '@openedx/paragon';
import { Folder } from '@openedx/paragon/icons';
import Loading from '@src/generic/Loading';
import { useMultiLibraryContext } from '@src/library-authoring/common/context/MultiLibraryContext';
import { useGetContentHits } from '@src/search-manager';
import { truncate } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import messages from './messages';

interface CollectionItemsProps {
  isPending: boolean;
  data?: Record<string, any>[];
  onChange: (id: string) => void;
}

const CollectionItems = ({ isPending, data, onChange }: CollectionItemsProps) => {
  const { selectedCollections } = useMultiLibraryContext();
  if (isPending) {
    return <Loading />;
  }

  if (!data || data.length === 0) {
    return (
      <span className="p-3">
        <FormattedMessage {...messages.collectionFilterBtnEmpty} />
      </span>
    );
  }

  return (
    <Scrollable
      className="m-0 p-0"
      style={{ maxHeight: '25vh' }}
    >
      {data.map((collection) => (
        <Dropdown.Item
          key={collection.block_id}
          as={Form.Checkbox}
          value={collection.block_id}
          onChange={() => onChange(collection.block_id)}
          className="py-2 my-1 overflow-auto"
          checked={selectedCollections.includes(collection.block_id)}
        >
          <div>
            {truncate(collection.display_name, { length: 50 })}
          </div>
        </Dropdown.Item>
      ))}
    </Scrollable>
  );
};

export const CollectionDropdownFilter = () => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const { selectedLibraries, selectedCollections, setSelectedCollections } = useMultiLibraryContext();
  const [label, setLabel] = useState(intl.formatMessage(messages.librariesFilterBtnText));
  const { data: baseData, isPending } = useGetContentHits(
    [
      'type = "collection"',
      `context_key = "${selectedLibraries[0]}"`,
      'last_published IS NOT NULL',
    ],
    selectedLibraries.length === 1,
    ['block_id', 'display_name'],
    100,
    false,
  );

  /** Filter the data based on search input */
  const data = useMemo(() => {
    if (!search.trim()) {
      return baseData?.hits;
    }
    return baseData?.hits.filter((hit) => hit.display_name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search, baseData]);

  const onChange = (libraryId: string) => {
    setSelectedCollections?.((prev) => {
      if (prev.includes(libraryId)) {
        return prev.filter((id) => id !== libraryId);
      }
      return [...prev, libraryId];
    });
  };

  useEffect(() => {
    const baseName = '';
    if (!selectedCollections.length) {
      setLabel(baseName);
    } else if (selectedCollections.length === 1) {
      setLabel(data?.find((lib) => lib.block_id === selectedCollections[0])?.display_name || baseName);
    } else if (selectedCollections.length > 1) {
      setLabel(intl.formatMessage(messages.collectionsFilterBtnCount, { count: selectedCollections.length }));
    }
  }, [label, selectedCollections, data]);

  return (
    <Dropdown
      id="collection-filter-dropdown"
      as={ButtonGroup}
      autoClose="outside"
      disabled={selectedLibraries.length !== 1}
    >
      <OverlayTrigger
        placement="auto"
        overlay={(
          <Tooltip variant="light" id="library-filter-tooltip">
            {label}
          </Tooltip>
        )}
      >
        <Dropdown.Toggle
          id="collection-filter-dropdown-toggle"
          iconBefore={Folder}
          className="text-overflow text-primary-500 py-2 px-4 mr-2"
          disabled={selectedLibraries.length !== 1}
          size="sm"
        >
          {truncate(label, { length: 30 })}
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu className="my-1">
        <SearchField
          onSubmit={setSearch}
          onChange={setSearch}
          onClear={() => setSearch('')}
          value={search}
          placeholder={intl.formatMessage(messages.collectionFilterBtnPlaceholder)}
          className="mx-1 border-0"
        />
        <Dropdown.Divider className="mb-0" />
        <CollectionItems isPending={isPending} data={data} onChange={onChange} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
