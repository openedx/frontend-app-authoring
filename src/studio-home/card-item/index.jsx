import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Hyperlink,
  Dropdown,
  IconButton,
  ActionRow,
} from '@openedx/paragon';
import { MoreHoriz } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { COURSE_CREATOR_STATES } from '../../constants';
import { getStudioHomeData } from '../data/selectors';
import messages from '../messages';
import { trimSlashes } from './utils';

const CardItem = ({
  intl,
  displayName,
  lmsLink,
  rerunLink,
  org,
  number,
  run,
  isLibraries,
  courseKey,
  isPaginated,
  url,
}) => {
  const {
    allowCourseReruns,
    courseCreatorStatus,
    rerunCreatorStatus,
  } = useSelector(getStudioHomeData);
  const destinationUrl = () => new URL(url, getConfig().STUDIO_BASE_URL);
  const subtitle = isLibraries ? `${org} / ${number}` : `${org} / ${number} / ${run}`;
  const readOnlyItem = !(lmsLink || rerunLink || url);
  const showActions = !(readOnlyItem || isLibraries);
  const isShowRerunLink = allowCourseReruns
    && rerunCreatorStatus
    && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const hasDisplayName = (displayName ?? '').trim().length ? displayName : courseKey;

  return (
    <Card className="card-item">
      <Card.Header
        size="sm"
        title={!readOnlyItem ? (
          <Hyperlink
            className="card-item-title"
            destination={destinationUrl().toString()}
          >
            {hasDisplayName}
          </Hyperlink>
        ) : (
          <span className="card-item-title">{displayName}</span>
        )}
        subtitle={subtitle}
        actions={showActions && (
          isPaginated ? (
            <Dropdown>
              <Dropdown.Toggle
                as={IconButton}
                iconAs={MoreHoriz}
                variant="primary"
                data-testid="toggle-dropdown"
              />
              <Dropdown.Menu>
                {isShowRerunLink && (
                  <Dropdown.Item href={trimSlashes(rerunLink)}>
                    {messages.btnReRunText.defaultMessage}
                  </Dropdown.Item>
                )}
                <Dropdown.Item href={lmsLink}>
                  {intl.formatMessage(messages.viewLiveBtnText)}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <ActionRow>
              {isShowRerunLink && (
                <Hyperlink
                  className="small"
                  destination={trimSlashes(rerunLink)}
                  key={`action-row-rerunLink-${courseKey}`}
                >
                  {intl.formatMessage(messages.btnReRunText)}
                </Hyperlink>
              )}
              <Hyperlink
                className="small ml-3"
                destination={lmsLink}
                key={`action-row-lmsLink-${courseKey}`}
              >
                {intl.formatMessage(messages.viewLiveBtnText)}
              </Hyperlink>
            </ActionRow>
          )
        )}
      />
    </Card>
  );
};

CardItem.defaultProps = {
  isLibraries: false,
  isPaginated: false,
  courseKey: '',
  rerunLink: '',
  lmsLink: '',
  run: '',
};

CardItem.propTypes = {
  intl: intlShape.isRequired,
  displayName: PropTypes.string.isRequired,
  lmsLink: PropTypes.string,
  rerunLink: PropTypes.string,
  org: PropTypes.string.isRequired,
  run: PropTypes.string,
  number: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isLibraries: PropTypes.bool,
  courseKey: PropTypes.string,
  isPaginated: PropTypes.bool,
};

export default injectIntl(CardItem);
