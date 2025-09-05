import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ToastContext } from '@src/generic/toast-context';

import { usePublishContainer } from '../data/apiHooks';
import messages from './messages';
import { ItemHierarchyPublisher } from '../hierarchy/ItemHierarchyPublisher';

type ContainerPublisherProps = {
  containerId: string;
  handleClose: () => void;
};

/**
 * ContainerPublisher handles the publishing flow for a given container.
 *
 * @param containerId - The unique identifier of the container.
 * @param handleClose - Function to handle close the publisher.
 */
export const ContainerPublisher = ({
  containerId,
  handleClose,
}: ContainerPublisherProps) => {
  const intl = useIntl();
  const publishContainer = usePublishContainer(containerId);
  const { showToast } = useContext(ToastContext);

  const handlePublish = useCallback(async () => {
    try {
      await publishContainer.mutateAsync();
      showToast(intl.formatMessage(messages.publishContainerSuccess));
    } catch (error) {
      showToast(intl.formatMessage(messages.publishContainerFailed));
    }
    handleClose();
  }, [publishContainer, showToast]);

  return (
    <ItemHierarchyPublisher
      itemId={containerId}
      handleClose={handleClose}
      handlePublish={handlePublish}
    />
  );
};
