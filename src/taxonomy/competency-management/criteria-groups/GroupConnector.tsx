import { useIntl } from '@edx/frontend-platform/i18n';
import { Stack } from '@openedx/paragon';
import type { CompetencyGroupLogicOperator } from '../data/types';
import LogicOperatorSelect from './LogicOperatorSelect';
import messages from './messages';

export interface GroupConnectorProps {
  /** The shared course-level group's own logic operator - every connector
   * between that course's sibling bottom-tier groups reads the same value,
   * not one of its own.
   */
  logicOperator: CompetencyGroupLogicOperator;
}

/** The Or/And connector rendered between two adjacent sibling bottom-tier
 * groups within the same course.
 */
const GroupConnector = ({ logicOperator }: GroupConnectorProps) => {
  const intl = useIntl();

  return (
    <Stack direction="horizontal" gap={2} className="group-connector">
      <span className="group-connector__line" aria-hidden="true" />
      <LogicOperatorSelect
        className="group-connector__label"
        value={logicOperator}
        labels={{
          and: intl.formatMessage(messages.logicOperatorAndLabel),
          or: intl.formatMessage(messages.logicOperatorOrLabel),
        }}
      />
      <span className="group-connector__line" aria-hidden="true" />
    </Stack>
  );
};

export default GroupConnector;
