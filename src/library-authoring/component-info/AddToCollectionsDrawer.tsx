import { useEffect } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Scrollable, SelectableBox, Stack, useCheckboxSetValues } from '@openedx/paragon';
import { Folder } from '@openedx/paragon/icons';

import {
  ContentHit,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
  useSearchContext,
} from '../../search-manager';
import messages from './messages';

interface CollectionsDrawerProps {
  contentHit: ContentHit;
}

const CollectionsSelectableBox = ({ contentHit }: CollectionsDrawerProps) => {
  const type = 'checkbox';
  const intl = useIntl();
  const { collectionHits } = useSearchContext();
  const [selectedCollections, {
    add,
    remove,
    set,
    clear,
  }] = useCheckboxSetValues(contentHit.collections?.key || []);

  useEffect(() => {
    set(contentHit.collections?.key || []);

    return () => {
      clear();
    }
  }, [contentHit])

  const handleChange = (e) => {
    e.target.checked ? add(e.target.value) : remove(e.target.value);
  };

  return (
    <Scrollable className="mt-3 p-1" style={{'height': '25vh'}}>
      <SelectableBox.Set
        value={selectedCollections}
        type={type}
        onChange={handleChange}
        name="selectedCollections"
        columns={1}
        ariaLabelledby={intl.formatMessage(messages.addToCollectionSelectionLabel)}
      >
        { collectionHits.map((contentHit) => (
          <SelectableBox
            className="d-inline-flex align-items-center shadow-none border border-gray-100"
            value={contentHit.blockId}
            key={contentHit.blockId}
            inputHidden={false}
            type={type}
            aria-label={contentHit.displayName}
          >
            <Stack className="ml-2" direction="horizontal" gap={2}>
              <Icon src={Folder} />
              <span>{contentHit.displayName}</span>
            </Stack>
          </SelectableBox>
        )) }
      </SelectableBox.Set>
    </Scrollable>
  );
}

const AddToCollectionsDrawer = ({ contentHit }: CollectionsDrawerProps) => {
  const intl = useIntl();
  const { displayName } = contentHit;
  return (
    <SearchContextProvider
      overrideQueries={{
        components: { limit: 0 },
        blockTypes: { limit: 0 },
      }}
      skipUrlUpdate
    >
      <Stack className="mt-2" gap={3}>
        <FormattedMessage
          {...messages.addToCollectionSubtitle}
          values={{ displayName }}
        />
        <Stack gap={1} direction="horizontal">
          <SearchKeywordsField
            className="flex-grow-1"
            placeholder={intl.formatMessage(messages.addToCollectionSearchPlaceholder)}
          />
          <SearchSortWidget iconOnly />
        </Stack>
        {/* Set key to update selection when component usageKey changes */}
        <CollectionsSelectableBox key={contentHit.usageKey} contentHit={contentHit} />
      </Stack>
    </SearchContextProvider>
  )
}

export default AddToCollectionsDrawer
