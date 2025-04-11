import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { InplaceTextEditor } from '../../generic/inplace-text-editor';
import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useUpdateXBlockFields, useXBlockFields } from '../data/apiHooks';
import messages from './messages';

const ComponentInfoHeader = () => {
  const intl = useIntl();

  const { readOnly, showOnlyPublished } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const usageKey = sidebarComponentInfo?.id;
  // istanbul ignore next
  if (!usageKey) {
    throw new Error('usageKey is required');
  }
  const {
    data: xblockFields,
  } = useXBlockFields(usageKey, showOnlyPublished ? 'published' : 'draft');

  const updateMutation = useUpdateXBlockFields(usageKey);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = (newDisplayName: string) => {
    updateMutation.mutateAsync({
      metadata: {
        display_name: newDisplayName,
      },
    }).then(() => {
      showToast(intl.formatMessage(messages.updateComponentSuccessMsg));
    }).catch(() => {
      showToast(intl.formatMessage(messages.updateComponentErrorMsg));
    });
  };

  if (!xblockFields) {
    return null;
  }

  return (
    <InplaceTextEditor
      onSave={handleSaveDisplayName}
      text={xblockFields?.displayName}
      readOnly={readOnly}
      textClassName="font-weight-bold m-1.5"
      showEditButton
    />
  );
};

export default ComponentInfoHeader;
