import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';

interface Props {
  className?: string;
}

/**
 * Informational banner for users who hold a page's `view` permission but not its
 * `manage`/`edit` permission, so the page renders read-only.
 *
 * Pair it with hiding the page's actionable controls -- this alert explains the
 * absence of those controls, it does not enforce anything on its own.
 */
const ViewOnlyPermissionsAlert = ({ className }: Props) => (
  <Alert variant="info" icon={Lock} className={className} data-testid="viewOnlyPermissionsAlert">
    <FormattedMessage
      id="authoring.alert.info.viewOnlyPermissions"
      defaultMessage="You have view-only access to this page. Contact your organization admin to request editing permissions."
      description="Alert shown to users who can view a page but do not have permission to edit it"
    />
  </Alert>
);

export default ViewOnlyPermissionsAlert;
