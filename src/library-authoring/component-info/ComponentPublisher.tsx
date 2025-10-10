import { useCallback, useContext } from 'react';

import { ToastContext } from '@src/generic/toast-context';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { usePublishComponent } from '../data/apiHooks';
import { ItemHierarchyPublisher } from '../hierarchy/ItemHierarchyPublisher';

type ComponentPublisherProps = {
  componentId: string;
  handleClose: () => void;
};

/**
 * ComponentPublisher handles the publishing flow for a given component.
 *
 * @param componentId - The unique identifier of the component.
 * @param handleClose - Function to handle close the publisher.
 */
export const ComponentPublisher = ({
  componentId,
  handleClose,
}: ComponentPublisherProps) => {
  const intl = useIntl();
  const publishComponent = usePublishComponent(componentId);
  const { showToast } = useContext(ToastContext);

  const handlePublish = useCallback(async () => {
    try {
      await publishComponent.mutateAsync();
      showToast(intl.formatMessage(messages.publishSuccessMsg));
    } catch (error) {
      showToast(intl.formatMessage(messages.publishErrorMsg));
    }
    handleClose();
  }, [publishComponent, showToast, intl]);

  return (
    <ItemHierarchyPublisher
      itemId={componentId}
      handleClose={handleClose}
      handlePublish={handlePublish}
    />
  );
};
