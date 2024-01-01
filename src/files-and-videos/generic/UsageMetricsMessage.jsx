import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import {
  Hyperlink,
  Icon,
  Row,
  Spinner,
} from '@openedx/paragon';
import { ErrorOutline } from '@openedx/paragon/icons';
import isEmpty from 'lodash/isEmpty';
import { RequestStatus } from '../../data/constants';
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
          <li key={`usage-location-${location.displayLocation}`} style={{ listStyle: 'none' }}>
            <Hyperlink destination={`${getConfig().STUDIO_BASE_URL}${location.url}`} target="_blank">
              {location.displayLocation}
            </Hyperlink>
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
