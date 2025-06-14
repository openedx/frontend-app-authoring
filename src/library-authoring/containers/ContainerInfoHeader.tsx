import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useContainer, useUpdateContainer } from '../data/apiHooks';
import messages from './messages';

const ContainerInfoHeader = () => {
  const intl = useIntl();

  const { readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const containerId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const { data: container } = useContainer(containerId);

  const updateMutation = useUpdateContainer(containerId);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = async (newDisplayName: string) => {
    try {
      await updateMutation.mutateAsync({
        displayName: newDisplayName,
      });
      showToast(intl.formatMessage(messages.updateContainerSuccessMsg));
    } catch (err) {
      showToast(intl.formatMessage(messages.updateContainerErrorMsg));
      throw err;
    }
  };

  if (!container) {
    return null;
  }

  return (
    <InplaceTextEditor
      onSave={handleSaveDisplayName}
      text={container.displayName}
      readOnly={readOnly}
      textClassName="font-weight-bold m-1.5"
    />
  );
};

export default ContainerInfoHeader;
