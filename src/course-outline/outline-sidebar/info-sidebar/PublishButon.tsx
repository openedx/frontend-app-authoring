import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from '../messages';

interface Props {
  onClick: () => void;
}

export const PublishButon = ({ onClick }: Props) => (
  <Button
    variant="outline-primary w-100 rounded status-button draft-status"
    className="m-1"
    onClick={onClick}
  >
    <strong className="mr-1">
      <FormattedMessage
        {...messages.publishContainerButton}
      />
    </strong>
    <FormattedMessage {...messages.draftText} />
  </Button>
);
