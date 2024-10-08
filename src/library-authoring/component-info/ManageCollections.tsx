import { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, Scrollable, SelectableBox, Stack, useCheckboxSetValues,
} from '@openedx/paragon';
import { Folder } from '@openedx/paragon/icons';

import {
  ContentHit,
  SearchContextProvider,
  SearchKeywordsField,
  SearchSortWidget,
  useSearchContext,
} from '../../search-manager';
import messages from './messages';
import { useUpdateComponentCollections } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

interface ManageCollectionsProps {
  contentHit: ContentHit;
}

interface CollectionsDrawerProps extends ManageCollectionsProps {
  onClose: () => void;
}

const CollectionsSelectableBox = ({ contentHit, onClose }: CollectionsDrawerProps) => {
  const type = 'checkbox';
  const intl = useIntl();
  const { collectionHits } = useSearchContext();
  const { showToast } = useContext(ToastContext);
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
    };
  }, [contentHit]);

  const updateCollectionsMutation = useUpdateComponentCollections(contentHit.contextKey, contentHit.usageKey);

  const handleConfirmation = () => {
    updateCollectionsMutation.mutateAsync(selectedCollections).then(() => {
      showToast(intl.formatMessage(messages.manageCollectionsToComponentSuccess));
      onClose();
    }).catch(() => {
      showToast(intl.formatMessage(messages.manageCollectionsToComponentFailed));
    });
  };

  const handleChange = (e) => (e.target.checked ? add(e.target.value) : remove(e.target.value));

  return (
    <Stack gap={4}>
      <Scrollable className="mt-3 p-1 border-bottom border-gray-100" style={{ height: '25vh' }}>
        <SelectableBox.Set
          value={selectedCollections}
          type={type}
          onChange={handleChange}
          name="selectedCollections"
          columns={1}
          ariaLabelledby={intl.formatMessage(messages.manageCollectionsSelectionLabel)}
        >
          {collectionHits.map((collectionHit) => (
            <SelectableBox
              className="d-inline-flex align-items-center shadow-none border border-gray-100"
              value={collectionHit.blockId}
              key={collectionHit.blockId}
              inputHidden={false}
              type={type}
              aria-label={collectionHit.displayName}
            >
              <Stack className="ml-2" direction="horizontal" gap={2}>
                <Icon src={Folder} />
                <span>{collectionHit.displayName}</span>
              </Stack>
            </SelectableBox>
          ))}
        </SelectableBox.Set>
      </Scrollable>
      <Stack direction="horizontal" gap={2}>
        <Button
          onClick={onClose}
          variant="outline-primary"
        >
          {intl.formatMessage(messages.manageCollectionsToComponentCancelBtn)}
        </Button>
        <Button
          onClick={handleConfirmation}
          className="flex-grow-1"
          variant="primary"
        >
          {intl.formatMessage(messages.manageCollectionsToComponentConfirmBtn)}
        </Button>
      </Stack>
    </Stack>
  );
};

const AddToCollectionsDrawer = ({ contentHit, onClose }: CollectionsDrawerProps) => {
  const intl = useIntl();
  const { displayName } = contentHit;

  return (
    <SearchContextProvider
      overrideQueries={{
        components: { limit: 0 },
        blockTypes: { limit: 0 },
      }}
      extraFilter={`context_key = "${contentHit.contextKey}"`}
      skipUrlUpdate
    >
      <Stack className="mt-2" gap={3}>
        <FormattedMessage
          {...messages.manageCollectionsText}
          values={{ displayName }}
        />
        <Stack gap={1} direction="horizontal">
          <SearchKeywordsField
            className="flex-grow-1"
            placeholder={intl.formatMessage(messages.manageCollectionsSearchPlaceholder)}
          />
          <SearchSortWidget iconOnly />
        </Stack>
        {/* Set key to update selection when component usageKey changes */}
        <CollectionsSelectableBox
          contentHit={contentHit}
          onClose={onClose}
        />
      </Stack>
    </SearchContextProvider>
  );
};

const ComponentCollections = ({ collections, onManageClick }: {
  collections?: string[];
  onManageClick: () => void;
}) => {
  const intl = useIntl();

  if (!collections) {
    return (
      <Stack gap={3}>
        <span className="border-bottom pb-3 border-gray-100">
          <FormattedMessage {...messages.componentNotOrganizedIntoCollection} />
        </span>
        <Button
          onClick={onManageClick}
          variant="primary"
        >
          {intl.formatMessage(messages.manageCollectionsAddBtnText)}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={4} className="mt-2">
      {collections.map((collection) => (
        <Stack
          className="border-bottom pb-4 border-gray-100"
          gap={2}
          direction="horizontal"
          key={collection}
        >
          <Icon src={Folder} />
          <span>{collection}</span>
        </Stack>
      ))}
      <Button
        onClick={onManageClick}
        variant="outline-primary"
      >
        {intl.formatMessage(messages.manageCollectionsText)}
      </Button>
    </Stack>
  );
};

const ManageCollections = ({ contentHit }: ManageCollectionsProps) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <AddToCollectionsDrawer
        contentHit={contentHit}
        onClose={() => setEditing(false)}
      />
    );
  }
  return (
    <ComponentCollections
      collections={contentHit.collections?.displayName}
      onManageClick={() => setEditing(true)}
    />
  );
};

export default ManageCollections;
