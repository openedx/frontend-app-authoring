import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { ToastContext } from '@src/generic/toast-context';
import { useContext } from 'react';
import messages from './messages';
import { useContentLibrary, useUpdateLibraryMetadata } from '../data/apiHooks';

type ToggleError = Error & {
  customAttributes?: {
    httpErrorStatus?: number;
  };
};

export const ERROR_TOAST_MAP: Record<number | string, { messageId: string }> = {
  500: { messageId: 'publicReadToggle500Error' },
  502: { messageId: 'publicReadToggle502Error' },
  503: { messageId: 'publicReadToggle503Error' },
  408: { messageId: 'publicReadToggle408Error' },

  // Generic fallback error
  DEFAULT: { messageId: 'publicReadToggleDefaultError' },
};

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
    }, {
      onError: (error: ToggleError) => {
        const errorStatus = error?.customAttributes?.httpErrorStatus || 'DEFAULT';
        const toastConfig = ERROR_TOAST_MAP[errorStatus] || ERROR_TOAST_MAP.DEFAULT;
        const message = formatMessage(messages[toastConfig.messageId]);
        showToast(message);
      },
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
