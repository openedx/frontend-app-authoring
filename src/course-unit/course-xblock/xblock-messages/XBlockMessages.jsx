import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Info as InfoIcon, WarningFilled as WarningIcon } from '@openedx/paragon/icons';

import messages from '../messages';
import { MESSAGE_ERROR_TYPES } from '../constants';
import { getMessagesBlockType } from './utils';

const XBlockMessages = ({ validationMessages }) => {
  const intl = useIntl();
  const type = getMessagesBlockType(validationMessages);
  const { warning } = MESSAGE_ERROR_TYPES;
  const alertVariant = type === warning ? 'warning' : 'danger';
  const alertIcon = type === warning ? WarningIcon : InfoIcon;

  if (!validationMessages.length) {
    return null;
  }

  return (
    <Alert
      variant={alertVariant}
      icon={alertIcon}
    >
      <Alert.Heading>
        {intl.formatMessage(messages.validationSummary)}
      </Alert.Heading>
      <ul>
        {validationMessages.map(({ text }) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </Alert>
  );
};

XBlockMessages.defaultProps = {
  validationMessages: [],
};

XBlockMessages.propTypes = {
  validationMessages: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    text: PropTypes.string,
  })),
};

export default XBlockMessages;
