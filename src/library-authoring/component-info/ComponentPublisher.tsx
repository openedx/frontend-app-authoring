import { useCallback, useContext } from 'react';

import Loading from '@src/generic/Loading';
import { ToastContext } from '@src/generic/toast-context';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { useLibraryBlockHierarchy, usePublishComponent } from '../data/apiHooks';
import { ItemHierarchyPublisher } from '../hierarchy/ItemHierarchyPublisher';

type ComponentPublisherProps = {
  componentId: string;
  handleClose: () => void;
};

export const ComponentPublisher = ({
  componentId,
  handleClose,
}: ComponentPublisherProps) => {
  const intl = useIntl();
  const {
    data: hierarchy,
    isLoading,
    isError,
  } = useLibraryBlockHierarchy(componentId);
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

  if (isLoading) {
    return <Loading />;
  }

  // istanbul ignore if: this should never happen
  if (isError) {
    return null;
  }

  return (
    <ItemHierarchyPublisher
      itemId={componentId}
      hierarchy={hierarchy}
      handleClose={handleClose}
      handlePublish={handlePublish}
    />
  );
};
