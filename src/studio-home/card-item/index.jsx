import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Hyperlink,
  Dropdown,
  IconButton,
} from '@edx/paragon';
import { MoreHoriz } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { COURSE_CREATOR_STATES } from '../../constants';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';

const CardItem = ({
  intl,
  displayName,
  lmsLink,
  rerunLink,
  org,
  number,
  run,
  isLibraries,
  url,
  cmsLink,
}) => {
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
  } = useSelector(getStudioHomeData);
  const courseUrl = () => new URL(url, getConfig().STUDIO_BASE_URL);
  const subtitle = isLibraries ? `${org} / ${number}` : `${org} / ${number} / ${run}`;
  const readOnlyItem = !(lmsLink || rerunLink || url);
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;

  return (
    <Card className="card-item">
      <Card.Header
        size="sm"
        title={!readOnlyItem ? (
          <Hyperlink
            className="card-item-title"
            destination={courseUrl().toString()}
          >
            {displayName}
          </Hyperlink>
        ) : (
          <span className="card-item-title">{displayName}</span>
        )}
        subtitle={subtitle}
        actions={showActions && (
          <Dropdown>
            <Dropdown.Toggle
              as={IconButton}
              iconAs={MoreHoriz}
              variant="primary"
              data-testid="toggle-dropdown"
            />
            <Dropdown.Menu>
              {isShowRerunLink && (
                <Dropdown.Item href={rerunLink}>
                  {messages.btnReRunText.defaultMessage}
                </Dropdown.Item>
              )}
              <Dropdown.Item href={lmsLink}>
                {intl.formatMessage(messages.viewLiveBtnText)}
              </Dropdown.Item>
              <Dropdown.Item href={cmsLink}>
                {intl.formatMessage(messages.editStudioBtnText)}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        )}
      />
    </Card>
  );
};

CardItem.defaultProps = {
  isLibraries: false,
  rerunLink: '',
  lmsLink: '',
  run: '',
  cmsLink: '',
};

CardItem.propTypes = {
  intl: intlShape.isRequired,
  displayName: PropTypes.string.isRequired,
  lmsLink: PropTypes.string,
  cmsLink: PropTypes.string,
  rerunLink: PropTypes.string,
  org: PropTypes.string.isRequired,
  run: PropTypes.string,
  number: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isLibraries: PropTypes.bool,
};

export default injectIntl(CardItem);
