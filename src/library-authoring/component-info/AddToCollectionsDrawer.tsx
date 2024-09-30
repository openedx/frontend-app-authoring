import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Scrollable, SelectableBox, Stack, useCheckboxSetValues } from '@openedx/paragon';
import { Folder } from '@openedx/paragon/icons';

import {
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
  useSearchContext,
} from '../../search-manager';
import { LibraryBlockMetadata } from "../data/api";
import messages from './messages';

interface CollectionsDrawerProps {
  componentMetadata: LibraryBlockMetadata;
}

const CollectionsSelectableBox = () => {
  const type = 'checkbox';
  const intl = useIntl();
  const { collectionHits, isFiltered } = useSearchContext();

  const [selectedCollections, { add, remove, clear }] = useCheckboxSetValues([]);
  const handleChange = (e) => {
    e.target.checked ? add(e.target.value) : remove(e.target.value);
  };

  return (
    <Scrollable className="mt-3" style={{'height': '25vh'}}>
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

const AddToCollectionsDrawer = ({ componentMetadata }: CollectionsDrawerProps) => {
  const intl = useIntl();
  const { displayName } = componentMetadata;
  return (
    <SearchContextProvider
      overrideQueries={{
        components: { limit: 0 },
        blockTypes: { limit: 0 },
      }}
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
        <CollectionsSelectableBox />
      </Stack>
    </SearchContextProvider>
  )
}

export default AddToCollectionsDrawer
