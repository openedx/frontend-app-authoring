import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Stack,
  Stepper,
} from '@openedx/paragon';

import messages from '../messages';

interface ConfirmStepProps {
  /** The changes that importing the file will make, one per line. */
  importPlan?: string[] | null;
}

/**
 * Wizard step where the user confirms that the previewed changes should be applied.
 */
export const ConfirmStep = ({ importPlan = null }: ConfirmStepProps) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="confirm" title={intl.formatMessage(messages.importWizardStepperConfirmStepTitle)}>
      <Stack gap={3} data-testid="confirm-step">
        <p className="mb-0">
          <FormattedMessage
            {...messages.importWizardStepConfirmWarning}
            values={{ changeCount: importPlan?.length }}
          />
        </p>
        <p className="mb-0">
          <FormattedMessage {...messages.importWizardStepConfirmQuestion} />
        </p>
      </Stack>
    </Stepper.Step>
  );
};
