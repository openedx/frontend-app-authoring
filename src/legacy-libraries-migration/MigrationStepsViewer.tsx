import { useIntl } from '@edx/frontend-platform/i18n';
import type { MessageDescriptor } from 'react-intl';
import {
  Bubble,
  Container,
  Icon,
  Stack,
} from '@openedx/paragon';
import { Check } from '@openedx/paragon/icons';

import type { MigrationStep } from './LegacyLibMigrationPage';
import messages from './messages';

export const MigrationStepsViewer = ({ currentStep }: { currentStep: MigrationStep }) => {
  const intl = useIntl();
  const stepNumbers: Record<MigrationStep, number> = {
    'select-libraries': 1,
    'select-destination': 2,
    'confirmation-view': 3,
  };
  const stepNames: Record<MigrationStep, MessageDescriptor> = {
    'select-libraries': messages.selectLegacyLibrariesStepTitle,
    'select-destination': messages.selectDestinationStepTitle,
    'confirmation-view': messages.confirmStepTitle,
  };

  const checkStep = (step: MigrationStep) => {
    if (currentStep === step) {
      return 'current';
    }

    switch (step) {
      case 'select-libraries':
        // If is not current, then is done.
        return 'done';
      case 'select-destination':
        if (currentStep === 'select-libraries') {
          return 'disabled';
        }
        return 'done';
      case 'confirmation-view':
        // If is not current, then is disabled.
        return 'disabled';
      default:
        return 'disabled';
    }

    return 'disabled';
  };

  const buildStep = (step: MigrationStep) => {
    const stepStatus = checkStep(step);
    return (
      <Stack direction="horizontal">
        <Bubble className="mr-2" disabled={stepStatus === 'disabled'}>
          {stepStatus === 'done' ? (
            <Icon src={Check} />
          ) : (
            stepNumbers[step]
          )}
        </Bubble>
        <div>
          <span>
            {intl.formatMessage(stepNames[step])}
          </span>
        </div>
      </Stack>
    );
  };

  return (
    <Container className="migration-steps-viewer d-flex justify-content-center mt-4 mb-4">
      {buildStep('select-libraries')}
      <hr className="ml-3 mr-3" />
      {buildStep('select-destination')}
      <hr className="ml-3 mr-3" />
      {buildStep('confirmation-view')}
    </Container>
  );
};
