import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Collapsible,
  Bubble,
  Icon,
  StatefulButton,
} from '@openedx/paragon';
import {
  Add as AddIcon,
  Minus as MinusIcon,
} from '@openedx/paragon/icons/es5';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import { COURSE_CREATOR_STATES, STATEFUL_BUTTON_STATES } from '../../constants';
import { getStudioHomeData, getSavingStatuses } from '../data/selectors';
import { requestCourseCreatorQuery } from '../data/thunks';
import messages from './messages';

const CollapsibleStateWithAction = ({ state, className }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    platformName,
    studioName,
    studioShortName,
  } = useSelector(getStudioHomeData);
  const { courseCreatorSavingStatus } = useSelector(getSavingStatuses);

  const requestButtonStates = {
    labels: {
      default: intl.formatMessage(messages.unrequestedCollapsibleDefaultButton),
      pending: intl.formatMessage(messages.unrequestedCollapsiblePendingButton),
      error: intl.formatMessage(messages.unrequestedCollapsibleFailedButton),
    },
    disabledStates: [STATEFUL_BUTTON_STATES.pending, STATEFUL_BUTTON_STATES.error],
  };

  const statusButtonMap = {
    [RequestStatus.PENDING]: STATEFUL_BUTTON_STATES.pending,
    [RequestStatus.FAILED]: STATEFUL_BUTTON_STATES.error,
  };

  const requestButtonCurrentState = statusButtonMap[courseCreatorSavingStatus] || STATEFUL_BUTTON_STATES.default;

  function getTextForStatus() {
    const matchTextAction = {
      [COURSE_CREATOR_STATES.denied]: {
        title: intl.formatMessage(messages.deniedCollapsibleTitle),
        description: intl.formatMessage(messages.deniedCollapsibleDescription, {
          studioName,
          platformName,
        }),
        stateName: intl.formatMessage(messages.deniedCollapsibleState),
        actionTitle: intl.formatMessage(messages.deniedCollapsibleActionTitle),
        actionText: intl.formatMessage(messages.deniedCollapsibleActionText, {
          platformName,
        }),
      },
      [COURSE_CREATOR_STATES.unrequested]: {
        title: intl.formatMessage(messages.unrequestedCollapsibleTitle, {
          studioShortName,
        }),
        description: intl.formatMessage(
          messages.unrequestedCollapsibleDescription,
          { studioName, platformName },
        ),
      },
      [COURSE_CREATOR_STATES.pending]: {
        title: intl.formatMessage(messages.pendingCollapsibleTitle),
        description: intl.formatMessage(
          messages.pendingCollapsibleDescription,
          { studioName, platformName },
        ),
        stateName: intl.formatMessage(messages.pendingCollapsibleState),
        actionTitle: intl.formatMessage(messages.pendingCollapsibleActionTitle),
        actionText: intl.formatMessage(messages.pendingCollapsibleActionText, {
          platformName,
        }),
      },
    };

    return matchTextAction[state];
  }

  const {
    title,
    stateName,
    actionText,
    description,
    actionTitle,
  } = getTextForStatus();

  return (
    <Collapsible.Advanced
      className={classNames('collapsible-card rounded-sm', className)}
      defaultOpen={[COURSE_CREATOR_STATES.denied, COURSE_CREATOR_STATES.pending].includes(state)}
      data-testid="collapsible-state-with-action"
    >
      <Collapsible.Trigger className="collapsible-trigger d-flex py-2.5 px-3.5 bg-gray-700">
        <span className="flex-grow-1 text-white small">{title}</span>
        <Collapsible.Visible whenClosed>
          <Bubble className="bg-light-700">
            <Icon
              src={AddIcon}
              className="text-gray-700"
              size="xs"
            />
          </Bubble>
        </Collapsible.Visible>
        <Collapsible.Visible whenOpen>
          <Bubble className="bg-light-700">
            <Icon
              src={MinusIcon}
              className="text-gray-700"
              size="xs"
            />
          </Bubble>
        </Collapsible.Visible>
      </Collapsible.Trigger>

      <Collapsible.Body className="collapsible-body bg-light-white py-3 px-3.5">
        <p className="small text-gray-700">{description}</p>
        <h5 className="text-gray-700">{actionTitle}</h5>
        {[COURSE_CREATOR_STATES.denied, COURSE_CREATOR_STATES.pending].includes(state) ? (
          <div
            className={classNames('py-1 px-2.5 rounded-sm', {
              'bg-danger-100': state === COURSE_CREATOR_STATES.denied,
              'bg-warning-100': state === COURSE_CREATOR_STATES.pending,
            })}
          >
            <span className="d-inline-block text-black font-weight-bold m-2.5">
              {stateName}
            </span>
            <span className="text-gray-700 small">{actionText}</span>
          </div>
        ) : (
          <StatefulButton
            key="request-button"
            size="sm"
            onClick={() => dispatch(requestCourseCreatorQuery())}
            state={requestButtonCurrentState}
            {...requestButtonStates}
          />
        )}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
};

CollapsibleStateWithAction.defaultProps = {
  className: undefined,
};

CollapsibleStateWithAction.propTypes = {
  state: PropTypes.oneOf(Object.values(COURSE_CREATOR_STATES)).isRequired,
  className: PropTypes.string,
};

export default CollapsibleStateWithAction;
