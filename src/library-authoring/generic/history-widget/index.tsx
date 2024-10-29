import { FormattedMessage, FormattedDate } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';

import messages from './messages';

const CustomFormattedDate = ({ date }: { date: string | Date }) => (
  <FormattedDate
    value={date}
    year="numeric"
    month="long"
    day="2-digit"
  />
);

type HistoryWidgedProps = {
  modified: string | Date | null;
  created: string | Date | null;
};

/**
  * This component displays the history of an entity (Last Modified and Created dates)
  *
  * This component doesn't handle fetching the data or any other side effects. It only displays the dates.
  *
  * @example
  * ```tsx
  * const { data: componentMetadata } = useLibraryBlockMetadata(usageKey);
  *
  * return <HistoryWidget {...componentMetadata} />;
  * ```
  */
const HistoryWidget = ({
  modified,
  created,
}: HistoryWidgedProps) => (
  <Stack className="history-widget-bar small" gap={3}>
    {modified && (
      <div>
        <div className="text-muted"><FormattedMessage {...messages.lastModifiedTitle} /> </div>
        <CustomFormattedDate date={modified} />
      </div>
    )}
    {created && (
      <div>
        <div className="text-muted"><FormattedMessage {...messages.createdTitle} /> </div>
        <CustomFormattedDate date={created} />
      </div>
    )}
  </Stack>
);

export default HistoryWidget;
