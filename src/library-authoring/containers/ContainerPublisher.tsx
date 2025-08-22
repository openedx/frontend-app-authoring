import { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ToastContext } from '@src/generic/toast-context';
import Loading from '@src/generic/Loading';

import { useContainerHierarchy, usePublishContainer } from '../data/apiHooks';
import messages from './messages';
import { ItemHierarchyPublisher } from '../hierarchy/ItemHierarchyPublisher';

type ContainerPublisherProps = {
  containerId: string;
  handleClose: () => void;
};

export const ContainerPublisher = ({
  containerId,
  handleClose,
}: ContainerPublisherProps) => {
  const intl = useIntl();
  const publishContainer = usePublishContainer(containerId);
  const {
    data: hierarchy,
    isLoading,
    isError,
  } = useContainerHierarchy(containerId);
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

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  return (
    <ItemHierarchyPublisher
      itemId={containerId}
      hierarchy={hierarchy}
      handleClose={handleClose}
      handlePublish={handlePublish}
    />
  );
};
