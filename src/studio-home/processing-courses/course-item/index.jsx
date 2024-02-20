import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Card,
  Hyperlink,
  Button,
  Icon,
} from '@openedx/paragon';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  RotateRight as RotateRightIcon,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { handleDeleteNotificationQuery } from '../../data/thunks';
import messages from './messages';

const CourseItem = ({ course }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    displayName, org, number, run, isInProgress, isFailed, dismissLink,
  } = course;
  const subtitle = `${org} / ${number} / ${run}`;

  return (
    <div data-testid="course-item">
      {isInProgress && (
        <Card className="card-item">
          <Card.Header
            size="sm"
            title={<p className="card-item-title">{displayName}</p>}
            subtitle={subtitle}
            actions={(
              <ActionRow>
                <Icon src={RotateRightIcon} className="spinner-icon" />
                <ActionRow.Spacer />
                <span className="small">{intl.formatMessage(messages.itemInProgressActionText)}</span>
              </ActionRow>
            )}
          />
          <Card.Divider />
          <Card.Section className="p-3.5 small text-gray-700 bg-light-200">
            {intl.formatMessage(messages.itemInProgressFooterText, {
              refresh: (
                <Hyperlink destination="/home">
                  {intl.formatMessage(messages.itemInProgressFooterHyperlink)}
                </Hyperlink>
              ),
            })}
          </Card.Section>
        </Card>
      )}

      {isFailed && (
        <Card className="card-item">
          <Card.Header
            size="sm"
            title={<p className="card-item-title">{displayName}</p>}
            subtitle={subtitle}
            actions={(
              <ActionRow>
                <Icon src={WarningIcon} className="text-danger-500" />
                <span className="small">{intl.formatMessage(messages.itemIsFailedActionText)}</span>
              </ActionRow>
            )}
          />
          <Card.Divider />
          <Card.Footer className="p-3.5 small text-gray-700 bg-danger-100 align-content-between">
            <span className="w-75 mr-auto">{intl.formatMessage(messages.itemFailedFooterText)}</span>
            <Button
              onClick={() => dispatch(handleDeleteNotificationQuery(dismissLink))}
              iconBefore={CloseIcon}
              variant="tertiary"
              size="sm"
            >
              {intl.formatMessage(messages.itemFailedFooterButton)}
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
};

CourseItem.propTypes = {
  course: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    courseKey: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    run: PropTypes.string.isRequired,
    isFailed: PropTypes.bool.isRequired,
    isInProgress: PropTypes.bool.isRequired,
    dismissLink: PropTypes.string.isRequired,
  }).isRequired,
};

export default CourseItem;
