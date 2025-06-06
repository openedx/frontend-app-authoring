import { useIntl } from '@edx/frontend-platform/i18n';
import { useContext } from 'react';
import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContainer, useUpdateContainer } from '../data/apiHooks';
import messages from './messages';

interface EditableTitleProps {
  containerId: string;
  textClassName?: string;
}

export const ContainerEditableTitle = ({ containerId, textClassName }: EditableTitleProps) => {
  const intl = useIntl();

  const { readOnly, showOnlyPublished } = useLibraryContext();

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
    }
  };

  // istanbul ignore if: this should never happen
  if (!container) {
    return null;
  }

  return (
    <InplaceTextEditor
      onSave={handleSaveDisplayName}
      text={showOnlyPublished ? (container.publishedDisplayName ?? container.displayName) : container.displayName}
      readOnly={readOnly}
      textClassName={textClassName}
    />
  );
};
