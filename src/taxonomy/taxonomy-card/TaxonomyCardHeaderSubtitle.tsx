import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { orgsCountEnabled } from './utils';
import { ReadOnlyBadge } from '../read-only-badge';

interface TaxonomyCardHeaderSubtitleProps {
  showReadOnlyBadge: boolean;
  orgsCount?: number;
}

/**
 * The subtitle of a taxonomy card
 */
export const TaxonomyCardHeaderSubtitle = ({
  showReadOnlyBadge,
  orgsCount,
}: TaxonomyCardHeaderSubtitleProps) => {
  const intl = useIntl();

  if (showReadOnlyBadge) {
    return <ReadOnlyBadge />;
  }

  if (orgsCountEnabled(orgsCount)) {
    return (
      <div className="font-italic">
        {intl.formatMessage(messages.assignedToOrgsLabel, { orgsCount })}
      </div>
    );
  }

  return null;
};
