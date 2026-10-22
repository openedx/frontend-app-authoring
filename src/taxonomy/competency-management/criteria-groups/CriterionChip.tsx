import { useIntl } from '@edx/frontend-platform/i18n';
import { Chip } from '@openedx/paragon';
import { Close, Warning } from '@openedx/paragon/icons';

import rootMessages from '@src/taxonomy/competency-management/messages';
import messages from './messages';

export interface CriterionChipProps {
  displayName: string;
  /** The criterion's subsection couldn't be resolved: renders the warning style. */
  unavailable?: boolean;
  /** Read aloud for an unavailable chip, which `displayName` alone can't place. */
  courseName?: string;
  /** Shows the remove ("x") icon, which calls this. Omitted when the author can't edit. */
  onRemove?: () => void;
  disabled?: boolean;
}

const CriterionChip = ({
  displayName,
  unavailable = false,
  courseName = '',
  onRemove = undefined,
  disabled = false,
}: CriterionChipProps) => {
  const intl = useIntl();
  return (
    <Chip
      variant={unavailable ? 'light' : 'dark'}
      className={unavailable ? 'criterion-chip criterion-chip--unavailable mr-1' : 'criterion-chip mr-1'}
      iconBefore={unavailable ? Warning : undefined}
      iconAfter={onRemove ? Close : undefined}
      iconAfterAlt={onRemove
        ? intl.formatMessage(rootMessages.removeCriterionButtonLabel, { subsectionName: displayName })
        : undefined}
      onIconAfterClick={onRemove}
      disabled={disabled}
    >
      {unavailable
        ? (
          <>
            <span className="sr-only">
              {intl.formatMessage(messages.unavailableCriterionAccessibleLabel, { courseName })}
            </span>
            <span aria-hidden="true">{displayName}</span>
          </>
        )
        : displayName}
    </Chip>
  );
};

export default CriterionChip;
