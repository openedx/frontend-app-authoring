import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import messages from './messages';

const HeaderNavigations = ({ headerNavigationsActions }) => {
  const intl = useIntl();
  const { handleViewLive, handlePreview } = headerNavigationsActions;

  return (
    <nav className="header-navigations ml-auto flex-shrink-0">
      <Button
        variant="outline-primary"
        onClick={handleViewLive}
      >
        {intl.formatMessage(messages.viewLiveButton)}
      </Button>
      <Button
        variant="outline-primary"
        onClick={handlePreview}
      >
        {intl.formatMessage(messages.previewButton)}
      </Button>
    </nav>
  );
};

HeaderNavigations.propTypes = {
  headerNavigationsActions: PropTypes.shape({
    handleViewLive: PropTypes.func.isRequired,
    handlePreview: PropTypes.func.isRequired,
  }).isRequired,
};

export default HeaderNavigations;
