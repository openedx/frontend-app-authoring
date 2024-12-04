import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Stack } from '@openedx/paragon';
import { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';

import { getItemIcon } from '../../generic/block-type-utils';
import { ToastContext } from '../../generic/toast-context';
import { BlockTypeLabel, useGetBlockTypes } from '../../search-manager';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useCollection, useUpdateCollection } from '../data/apiHooks';
import HistoryWidget from '../generic/history-widget';
import messages from './messages';

interface BlockCountProps {
  count: number,
  blockType?: string,
  label: React.ReactNode,
  className?: string,
}

const BlockCount = ({
  count,
  blockType,
  label,
  className,
}: BlockCountProps) => {
  const icon = blockType && getItemIcon(blockType);
  return (
    <Stack className={classNames('text-center', className)}>
      <span className="text-muted">{label}</span>
      <Stack direction="horizontal" gap={1} className="justify-content-center">
        {icon && <Icon src={icon} size="lg" />}
        <span>{count}</span>
      </Stack>
    </Stack>
  );
};

const CollectionStatsWidget = () => {
  const { libraryId } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();
  const collectionId = sidebarComponentInfo?.id;

  const { data: blockTypes } = useGetBlockTypes([
    `context_key = "${libraryId}"`,
    `collections.key = "${collectionId}"`,
  ]);

  if (!blockTypes) {
    return null;
  }

  const blockSlots = ['problem', 'html', 'video'];

  const totalBlocksCount = Object.values(blockTypes).reduce((acc, count) => acc + count, 0);

  if (totalBlocksCount === 0) {
    return (
      <div
        className="text-center text-muted align-content-center"
        style={{
          height: '72px', // same height as the BlockCount component
        }}
      >
        <FormattedMessage {...messages.detailsTabStatsNoComponents} />
      </div>
    );
  }

  const otherBlocksCount = Object.entries(blockTypes).filter(([blockType]) => !blockSlots.includes(blockType))
    .reduce((acc, [, count]) => acc + count, 0);

  return (
    <Stack direction="horizontal" className="p-2 justify-content-between" gap={2}>
      <BlockCount
        label={<FormattedMessage {...messages.detailsTabStatsTotalComponents} />}
        count={totalBlocksCount}
        className="border-right"
      />
      {blockSlots.map((blockType) => (
        <BlockCount
          key={blockType}
          label={<BlockTypeLabel blockType={blockType} />}
          blockType={blockType}
          count={blockTypes[blockType] || 0}
        />
      ))}
      {!!otherBlocksCount && (
        <BlockCount
          label={<FormattedMessage {...messages.detailsTabStatsOtherComponents} />}
          count={otherBlocksCount}
        />
      )}
    </Stack>
  );
};

const CollectionDetails = () => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);
  const { libraryId, readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const collectionId = sidebarComponentInfo?.id;
  // istanbul ignore next: This should never happen
  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  const updateMutation = useUpdateCollection(libraryId, collectionId);
  const { data: collection } = useCollection(libraryId, collectionId);

  const [description, setDescription] = useState(collection?.description || '');

  useEffect(() => {
    if (collection) {
      setDescription(collection.description);
    }
  }, [collection]);

  if (!collection) {
    return null;
  }

  const onSubmit = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    if (newDescription === collection.description) {
      return;
    }
    updateMutation.mutateAsync({
      description: newDescription,
    }).then(() => {
      showToast(intl.formatMessage(messages.updateCollectionSuccessMsg));
    }).catch(() => {
      showToast(intl.formatMessage(messages.updateCollectionErrorMsg));
    });
  };

  return (
    <Stack
      gap={3}
    >
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabDescriptionTitle)}
        </h3>
        {!readOnly ? (
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={onSubmit}
          />
        ) : collection.description}
      </div>
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabStatsTitle)}
        </h3>
        <CollectionStatsWidget />
      </div>
      <hr className="w-100" />
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabHistoryTitle)}
        </h3>
        <HistoryWidget
          created={collection.created ? new Date(collection.created) : null}
          modified={collection.modified ? new Date(collection.modified) : null}
        />
      </div>
    </Stack>
  );
};

export default CollectionDetails;
