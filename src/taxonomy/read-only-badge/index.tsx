import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Badge,
} from '@openedx/paragon';
import messages from './messages';

export const ReadOnlyBadge = () => {
  return (
    <Badge variant="light" className="p-1.5 font-weight-normal read-only-badge">
      <FormattedMessage {...messages.readOnlyBadge} />
    </Badge>
  );
};
