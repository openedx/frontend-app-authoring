import { useIntl } from '@edx/frontend-platform/i18n';
import { useContext } from 'react';
import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useContainer, useUpdateContainer } from '../data/apiHooks';
import messages from './messages';

interface EditableTitleProps {
  containerId: string;
  readOnly?: boolean;
  textClassName?: string;
  // In some cases, the title is already available, but it's retrieved in a list of containers.
  // In these cases, it's necessary to use this `ContainerEditableTitle` for the optimistic update to work.
  // By using `placeHolderText`, we can give the illusion that the data
  // has already been loaded before using the real data.
  placeHolderText?: string;
}

export const ContainerEditableTitle = ({
  containerId,
  readOnly,
  textClassName,
  placeHolderText,
}: EditableTitleProps) => {
  const intl = useIntl();

  const { readOnly: libReadOnly, showOnlyPublished } = useLibraryContext();

  const { data: container, isLoading } = useContainer(containerId);

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

  let textTitle;
  if (isLoading && placeHolderText) {
    textTitle = placeHolderText;
  } else if (isLoading || !container) {
    textTitle = '';
  } else {
    textTitle = showOnlyPublished ? (container.publishedDisplayName ?? container.displayName) : container.displayName;
  }

  return (
    <InplaceTextEditor
      onSave={handleSaveDisplayName}
      text={textTitle}
      readOnly={readOnly || libReadOnly}
      textClassName={textClassName}
    />
  );
};
