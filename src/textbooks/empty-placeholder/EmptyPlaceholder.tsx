import { useIntl } from '@edx/frontend-platform/i18n';
import { Add as IconAdd } from '@openedx/paragon/icons';
import { Button } from '@openedx/paragon';

import messages from './messages';

export interface EmptyPlaceholderProps {
  onCreateNewTextbook: () => void;
}

const EmptyPlaceholder = ({ onCreateNewTextbook }: EmptyPlaceholderProps) => {
  const intl = useIntl();

  return (
    <div className="textbooks-empty-placeholder bg-white" data-testid="textbooks-empty-placeholder">
      <p className="mb-0 small text-gray-700">{intl.formatMessage(messages.title)}</p>
      <Button iconBefore={IconAdd} onClick={onCreateNewTextbook}>
        {intl.formatMessage(messages.button)}
      </Button>
    </div>
  );
};

export default EmptyPlaceholder;
