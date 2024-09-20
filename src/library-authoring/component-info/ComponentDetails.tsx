import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import { useLibraryBlockMetadata } from '../data/apiHooks';
import HistoryWidget from '../generic/history-widget';
import { ComponentDeveloperInfo } from './ComponentDeveloperInfo';
import messages from './messages';

interface ComponentDetailsProps {
  usageKey: string;
}

const ComponentDetails = ({ usageKey }: ComponentDetailsProps) => {
  const intl = useIntl();
  const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);

  // istanbul ignore if: this should never happen
  if (!componentMetadata) {
    return null;
  }

  return (
    <Stack gap={3}>
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabUsageTitle)}
        </h3>
        <small>This will show the courses that use this component.</small>
      </div>
      <hr className="w-100" />
      <div>
        <h3 className="h5">
          {intl.formatMessage(messages.detailsTabHistoryTitle)}
        </h3>
        <HistoryWidget
          {...componentMetadata}
        />
      </div>
      {
        // istanbul ignore next: this is only shown in development
        (process.env.NODE_ENV === 'development' ? <ComponentDeveloperInfo usageKey={usageKey} /> : null)
      }
    </Stack>
  );
};

export default ComponentDetails;
