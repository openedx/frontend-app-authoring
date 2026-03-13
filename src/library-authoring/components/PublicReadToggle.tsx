import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import messages from './messages';
import { useContentLibrary, useUpdateLibraryMetadata } from '../data/apiHooks';

type PublicReadToggleProps = {
  libraryId: string;
  canEditToggle: boolean;
};

const PublicReadToggle = ({ libraryId, canEditToggle }: PublicReadToggleProps) => {
  const intl = useIntl();
  const { data: library } = useContentLibrary(libraryId);
  const { mutateAsync: updateLibrary, isPending } = useUpdateLibraryMetadata();

  const onChangeToggle = async () => {
    await updateLibrary({
      id: libraryId,
      allow_public_read: !library?.allowPublicRead,
    });
  };

  return (
    <Form.Switch
      checked={library?.allowPublicRead}
      disabled={!canEditToggle || isPending}
      onChange={onChangeToggle}
      helperText={
        <span>{intl.formatMessage(messages.publicReadToggleSubtext)}</span>
      }
    >
      {intl.formatMessage(messages.publicReadToggleLabel)}
    </Form.Switch>
  );
};

export default PublicReadToggle;
