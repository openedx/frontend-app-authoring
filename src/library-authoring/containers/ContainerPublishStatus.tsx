/**
 * Shows the LibraryContainer's publish status,
 * and enables publishing any unpublished changes.
 */
import {
  useToggle,
} from '@openedx/paragon';
import Loading from '@src/generic/Loading';

import { useContainer } from '../data/apiHooks';
import { ContainerPublisher } from './ContainerPublisher';
import { PublishDraftButton, PublishedChip } from '../generic/publish-status-buttons';

type ContainerPublishStatusProps = {
  containerId: string;
};

const ContainerPublishStatus = ({
  containerId,
}: ContainerPublishStatusProps) => {
  const [isConfirmingPublish, confirmPublish, cancelPublish] = useToggle(false);
  const {
    data: container,
    isLoading,
    isError,
  } = useContainer(containerId);

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  if (!container.hasUnpublishedChanges) {
    return <PublishedChip />;
  }

  return (
    (isConfirmingPublish
      ? (
        <ContainerPublisher
          handleClose={cancelPublish}
          containerId={containerId}
        />
      ) : (
        <PublishDraftButton
          onClick={confirmPublish}
        />
      )
    )
  );
};

export default ContainerPublishStatus;
