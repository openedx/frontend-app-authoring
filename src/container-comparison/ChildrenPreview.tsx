import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import messages from './messages';

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
  side: 'Before' | 'After';
}

const ChildrenPreview = ({ title, children, side }: Props) => {
  const intl = useIntl();
  const sideTitle = side === 'Before'
    ? intl.formatMessage(messages.diffBeforeTitle)
    : intl.formatMessage(messages.diffAfterTitle);

  return (
    <Stack direction="vertical">
      <span className="text-center">{sideTitle}</span>
      <span className="mt-2 mb-3 text-md text-gray-800">{title}</span>
      {children}
    </Stack>
  );
};

export default ChildrenPreview;
