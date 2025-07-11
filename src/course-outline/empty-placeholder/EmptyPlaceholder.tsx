import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import messages from './messages';

interface Props {
  children: React.ReactElement;
}

const EmptyPlaceholder = ({ children }: Props) => {
  const intl = useIntl();

  return (
    <Stack direction="vertical" className="outline-empty-placeholder bg-gray-100" data-testid="empty-placeholder">
      <p className="mb-0 text-gray-500">{intl.formatMessage(messages.title)}</p>
      {children}
    </Stack>
  );
};

export default EmptyPlaceholder;
