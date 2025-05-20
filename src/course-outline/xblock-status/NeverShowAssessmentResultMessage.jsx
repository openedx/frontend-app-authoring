import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { HelpOutline } from '@openedx/paragon/icons';
import messages from '../../generic/configure-modal/messages';

const NeverShowAssessmentResultMessage = () => {
  const intl = useIntl();
  return (
    <div className="d-flex align-items-center" data-testid="never-show-assessment-result-message">
      <Icon className="mr-1" size="sm" src={HelpOutline} />
      <span className="status-hide-after-due-value">
        {intl.formatMessage(messages.neverShowAssessmentResults)}
      </span>
    </div>
  );
};

NeverShowAssessmentResultMessage.propTypes = {};

export default NeverShowAssessmentResultMessage;
