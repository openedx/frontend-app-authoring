import PropTypes from 'prop-types';
import { Info as InfoIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import AlertMessage from '../../../generic/alert-message';
import messages from './messages';

const RenderErrorAlert = ({
  variant, icon, title, description, errorMessage, ...props
}) => {
  const intl = useIntl();

  return (
    <AlertMessage
      icon={icon}
      className="m-0"
      variant={variant}
      title={title || intl.formatMessage(messages.alertRenderErrorTitle)}
      description={description || (
        <>
          <p className="mt-4 mb-1">{intl.formatMessage(messages.alertRenderErrorDescription)}</p>
          <p className="mb-0">{intl.formatMessage(messages.alertRenderErrorMessage, { message: errorMessage })}</p>
        </>
      )}
      {...props}
    />
  );
};

RenderErrorAlert.defaultProps = {
  icon: InfoIcon,
  variant: 'danger',
  title: undefined,
  description: undefined,
};

RenderErrorAlert.propTypes = {
  variant: 'danger',
  icon: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  errorMessage: PropTypes.string.isRequired,
};

export default RenderErrorAlert;
