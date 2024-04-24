import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton, Hyperlink } from '@openedx/paragon';
import { ArrowForward, Settings } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';
import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

const PageSettingButton = ({
  id,
  legacyLink,
  allowedOperations,
}) => {
  const { formatMessage } = useIntl();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const navigate = useNavigate();

  if (legacyLink) {
    return (
      <Hyperlink destination={legacyLink}>
        <IconButton
          src={ArrowForward}
          iconAs={Icon}
          size="inline"
          alt={formatMessage(messages.settings)}
        />
      </Hyperlink>
    );
  } if (!(allowedOperations?.configure || allowedOperations?.enable)) {
    return null;
  }
  return (
    <IconButton
      src={Settings}
      iconAs={Icon}
      size="inline"
      alt={formatMessage(messages.settings)}
      onClick={() => navigate(`${pagesAndResourcesPath}/${id}/settings`)}
    />
  );
};

PageSettingButton.defaultProps = {
  legacyLink: null,
  allowedOperations: null,
};

PageSettingButton.propTypes = {
  id: PropTypes.string.isRequired,
  legacyLink: PropTypes.string,
  allowedOperations: PropTypes.shape({
    configure: PropTypes.bool,
    enable: PropTypes.bool,
  }),
};

export default PageSettingButton;
