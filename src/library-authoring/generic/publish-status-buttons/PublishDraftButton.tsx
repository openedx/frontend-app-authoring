import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';

import messages from './messages';

type PublishDraftButtonProps = {
  onClick: () => void;
};

/**
 * PublishDraftButton renders a button that triggers the publishing action
 * for a draft component/container.
 *
 * The button is disabled when the library is in read-only mode.
 * It displays a localized label along with the draft status.
 *
 * @param onClick - Callback invoked when the button is clicked.
 */
export const PublishDraftButton = ({
  onClick,
}: PublishDraftButtonProps) => {
  const intl = useIntl();
  const { readOnly } = useLibraryContext();

  return (
    <Button
      variant="outline-primary w-100 rounded-0 status-button draft-status font-weight-bold"
      className="m-1"
      disabled={readOnly}
      onClick={onClick}
    >
      <FormattedMessage
        {...messages.publishContainerButton}
        values={{
          publishStatus: (
            <span className="font-weight-500">
              ({intl.formatMessage(messages.draftChipText)})
            </span>
          ),
        }}
      />
    </Button>
  );
};
