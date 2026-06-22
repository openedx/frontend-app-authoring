import { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@openedx/paragon';
import { ArrowForward, Settings } from '@openedx/paragon/icons';
import { useNavigate, Link } from 'react-router-dom';

import { useCourseUserPermissions } from '../../authz/hooks';
import { getAdvancedSettingsPermissions } from '../../authz/permissionHelpers';
import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

const PageSettingButton = ({
  id,
  courseId,
  legacyLink,
  allowedOperations,
}) => {
  const { formatMessage } = useIntl();
  const { path: pagesAndResourcesPath, isEditable } = useContext(PagesAndResourcesContext);
  const { canManageAdvancedSettings } = useCourseUserPermissions(courseId, getAdvancedSettingsPermissions(courseId));
  const navigate = useNavigate();

  const determineLinkDestination = useMemo(() => (
    legacyLink?.includes('textbooks') || legacyLink?.includes('tabs')
      ? `/course/${courseId}/${id.replace('_', '-')}`
      : null
  ), [legacyLink, courseId, id]);

  const canConfigureOrEnable = allowedOperations?.configure || allowedOperations?.enable;

  if (determineLinkDestination && !isEditable) {
    return (
      <IconButton
        src={ArrowForward}
        iconAs={Icon}
        size="inline"
        alt={formatMessage(messages.settings)}
        className="text-muted"
        disabled
      />
    );
  }

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

  const isGearDisabled = (id === 'progress' || id === 'wiki') && !canManageAdvancedSettings;

  return (
    <IconButton
      src={Settings}
      iconAs={Icon}
      size="inline"
      alt={formatMessage(messages.settings)}
      disabled={isGearDisabled}
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
