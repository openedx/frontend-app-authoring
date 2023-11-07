import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Icon, Row, Spinner } from '@edx/paragon';
import { ErrorOutline } from '@edx/paragon/icons';
import isEmpty from 'lodash/isEmpty';
import { RequestStatus } from '../data/constants';
import messages from './messages';

const UsageMetricsMessage = ({
  usagePathStatus,
  usageLocations,
  error,
  // injected
  intl,
}) => {
  let usageMessage;
  if (usagePathStatus === RequestStatus.SUCCESSFUL) {
    usageMessage = isEmpty(usageLocations) ? (
      <FormattedMessage {...messages.usageNotInUseMessage} />
    ) : (
      <ul className="p-0">
        {usageLocations.map(location => (
          <li key={`usage-location-${location}`} style={{ listStyle: 'none' }}>
            {location}
          </li>
        ))}
      </ul>
    );
  } else if (usagePathStatus === RequestStatus.FAILED) {
    usageMessage = (
      <Row className="m-0 pt-1">
        <Icon
          className="mr-1 text-danger-500"
          size="sm"
          src={ErrorOutline}
        />
        {intl.formatMessage(messages.errorAlertMessage, { message: error })}
      </Row>
    );
  } else {
    usageMessage = (
      <>
        <Spinner
          animation="border"
          size="sm"
          className="mie-3"
          screenReaderText={intl.formatMessage(messages.usageLoadingMessage)}
        />
        <FormattedMessage {...messages.usageLoadingMessage} />
      </>
    );
  }
  return usageMessage;
};

UsageMetricsMessage.propTypes = {
  usagePathStatus: PropTypes.string.isRequired,
  usageLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
  error: PropTypes.arrayOf(PropTypes.string).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(UsageMetricsMessage);
