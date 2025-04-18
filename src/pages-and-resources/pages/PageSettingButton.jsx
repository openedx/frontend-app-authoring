import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowForward, Settings } from '@openedx/paragon/icons';
import { useNavigate, Link } from 'react-router-dom';

import { getWaffleFlags } from '../../data/selectors';
import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

const PageSettingButton = ({
  id,
  courseId,
  legacyLink,
  allowedOperations,
}) => {
  const { formatMessage } = useIntl();
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const navigate = useNavigate();
  const waffleFlags = useSelector(getWaffleFlags);

  const determineLinkDestination = useMemo(() => {
    if (!legacyLink) { return null; }

    if (legacyLink.includes('textbooks')) {
      return waffleFlags.useNewTextbooksPage
        ? `/course/${courseId}/${id.replace('_', '-')}`
        : legacyLink;
    }

    if (legacyLink.includes('tabs')) {
      return waffleFlags.useNewCustomPages
        ? `/course/${courseId}/${id.replace('_', '-')}`
        : legacyLink;
    }

    return null;
  }, [legacyLink, waffleFlags, id]);

  const canConfigureOrEnable = allowedOperations?.configure || allowedOperations?.enable;

  if (determineLinkDestination) {
    return (
      <Link to={determineLinkDestination}>
        <IconButton
          src={ArrowForward}
          iconAs={Icon}
          size="inline"
          alt={formatMessage(messages.settings)}
        />
      </Link>
    );
  }

  if (!canConfigureOrEnable) {
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
  courseId: null,
};

PageSettingButton.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string,
  legacyLink: PropTypes.string,
  allowedOperations: PropTypes.shape({
    configure: PropTypes.bool,
    enable: PropTypes.bool,
  }),
};

export default PageSettingButton;
