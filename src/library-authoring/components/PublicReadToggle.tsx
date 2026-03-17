import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { ToastContext } from '@src/generic/toast-context';
import { useContext } from 'react';
import messages from './messages';
import { useContentLibrary, useUpdateLibraryMetadata } from '../data/apiHooks';

type PublicReadToggleProps = {
  libraryId: string;
  canEditToggle: boolean;
};

const PublicReadToggle = ({ libraryId, canEditToggle }: PublicReadToggleProps) => {
  const { formatMessage } = useIntl();
  const { data: library } = useContentLibrary(libraryId);
  const { mutateAsync: updateLibrary, isPending } = useUpdateLibraryMetadata();
  const { showToast } = useContext(ToastContext);

  const onChangeToggle = async () => {
    await updateLibrary({
      id: libraryId,
      allow_public_read: !library?.allowPublicRead,
    }).catch(() => {
      showToast(formatMessage(messages.publicReadToggleDefaultError));
    });
  };

  return (
    <Form.Switch
      checked={library?.allowPublicRead}
      disabled={!canEditToggle || isPending}
      onChange={onChangeToggle}
      helperText={
        <span>{formatMessage(messages.publicReadToggleSubtext)}</span>
      }
    >
      {formatMessage(messages.publicReadToggleLabel)}
    </Form.Switch>
  );
};

export default PublicReadToggle;
