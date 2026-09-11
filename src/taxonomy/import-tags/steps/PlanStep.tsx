import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Stack,
  Stepper,
} from '@openedx/paragon';

import messages from '../messages';

interface PlanStepProps {
  /** The changes that importing the file will make, one per line. */
  importPlan?: string[] | null;
}

/**
 * Wizard step that previews the changes that importing the file will make.
 */
export const PlanStep = ({ importPlan = null }: PlanStepProps) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="plan" title={intl.formatMessage(messages.importWizardStepperPlanStepTitle)}>
      <Stack gap={3} data-testid="plan-step">
        <p className="mb-0">
          <FormattedMessage
            {...messages.importWizardStepPlanSummary}
            values={{ changeCount: importPlan?.length }}
          />
        </p>
        <p className="mb-0">
          <FormattedMessage {...messages.importWizardStepPlanListLabel} />
        </p>
        <ul className="h-200px" style={{ overflow: 'scroll' }}>
          {importPlan?.length ?
            (
              importPlan.map((line) => <li key={line} data-testid="plan-action">{line}</li>)
            ) :
            <li>{intl.formatMessage(messages.importWizardStepPlanNoChanges)}</li>}
        </ul>
      </Stack>
    </Stepper.Step>
  );
};
