import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Icon, Stack } from '@openedx/paragon';
import { useContext, useState } from 'react';
import classNames from 'classnames';

import { getItemIcon } from '../../generic/block-type-utils';
import { ToastContext } from '../../generic/toast-context';
import { BlockTypeLabel, type CollectionHit, useGetBlockTypes } from '../../search-manager';
import type { ContentLibrary } from '../data/api';
import { useUpdateCollection } from '../data/apiHooks';
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

interface CollectionStatsWidgetProps {
  collection: CollectionHit,
}

const CollectionStatsWidget = ({ collection }: CollectionStatsWidgetProps) => {
  const { data: blockTypes } = useGetBlockTypes([
    `context_key = "${collection.contextKey}"`,
    `collections.key = "${collection.blockId}"`,
  ]);

  if (!blockTypes) {
    return null;
  }

  const blockTypesArray = Object.entries(blockTypes)
    .map(([blockType, count]) => ({ blockType, count }))
    .sort((a, b) => b.count - a.count);

  const totalBlocksCount = blockTypesArray.reduce((acc, { count }) => acc + count, 0);
  const otherBlocks = blockTypesArray.splice(3);
  const otherBlocksCount = otherBlocks.reduce((acc, { count }) => acc + count, 0);

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

  return (
    <Stack direction="horizontal" className="p-2 justify-content-between" gap={2}>
      <BlockCount
        label={<FormattedMessage {...messages.detailsTabStatsTotalComponents} />}
        count={totalBlocksCount}
        className="border-right"
      />
      {blockTypesArray.map(({ blockType, count }) => (
        <BlockCount
          key={blockType}
          label={<BlockTypeLabel type={blockType} />}
          blockType={blockType}
          count={count}
        />
      ))}
      {otherBlocks.length > 0 && (
        <BlockCount
          label={<FormattedMessage {...messages.detailsTabStatsOtherComponents} />}
          count={otherBlocksCount}
        />
      )}
    </Stack>
  );
};

interface CollectionDetailsProps {
  library: ContentLibrary,
  collection: CollectionHit,
}

const CollectionDetails = ({ library, collection }: CollectionDetailsProps) => {
  const intl = useIntl();
  const { showToast } = useContext(ToastContext);

  const [description, setDescription] = useState(collection.description);

  const updateMutation = useUpdateCollection(collection.contextKey, collection.blockId);

  // istanbul ignore if: this should never happen
  if (!collection) {
    throw new Error('A collection must be provided to CollectionDetails');
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
        {library.canEditLibrary ? (
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
        <CollectionStatsWidget collection={collection} />
      </div>
      <hr className="w-100" />
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabHistoryTitle)}
        </h3>
        <HistoryWidget
          created={collection.created ? new Date(collection.created * 1000) : null}
          modified={collection.modified ? new Date(collection.modified * 1000) : null}
        />
      </div>
    </Stack>
  );
};

export default CollectionDetails;
