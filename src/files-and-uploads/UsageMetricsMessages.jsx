import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Spinner } from '@edx/paragon';
import isEmpty from 'lodash/isEmpty';
import { RequestStatus } from '../data/constants';
import messages from './messages';

const UsageMetricsMessage = ({
  usagePathStatus,
  usageLocations,
  // injected
  intl,
}) => {
  let usageMessage;
  if (usagePathStatus === RequestStatus.SUCCESSFUL) {
    usageMessage = isEmpty(usageLocations) ? (
      <FormattedMessage {...messages.usageNotInUseMessage} />
    ) : (
      <ul className="p-0">
        {usageLocations.map((location) => (<li style={{ listStyle: 'none' }}>{location}</li>))}
      </ul>
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
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(UsageMetricsMessage);
