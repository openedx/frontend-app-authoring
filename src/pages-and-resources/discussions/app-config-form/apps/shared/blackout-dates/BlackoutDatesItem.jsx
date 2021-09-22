import React, { useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button,
  Card,
  Collapsible,
  Form,
  Icon,
  IconButton,
  Badge,
} from '@edx/paragon';
import { Delete, ExpandLess, ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import _ from 'lodash';

import messages from '../messages';
import BlackoutDatesInput from './BlackoutDatesInput';
import { formatBlackoutDates } from '../../../utils';
import {
  blackoutDatesStatus as constants,
  deleteHelperText,
  badgeVariant,
} from '../../../../data/constants';

const BlackoutDatesItem = ({
  intl,
  index,
  blackoutDate,
  onDelete,
  hasError,
  onCollapse,
}) => {
  const blackoutDatesHasError = !blackoutDate.startDate || !blackoutDate.endDate || hasError;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [collapseIsOpen, setCollapseOpen] = useState(blackoutDatesHasError);

  const getHeading = (isOpen) => {
    if (isOpen) {
      return (
        <span className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.configureBlackoutDates)}
        </span>
      );
    }
    return (
      <div className="py-2">
        <Badge variant={badgeVariant[blackoutDate.status]}>
          {intl.formatMessage(messages.blackoutDatesStatus, {
            status: _.startCase(_.toLower(blackoutDate.status)),
          })}
        </Badge>
        <div>{formatBlackoutDates(blackoutDate)}</div>
      </div>
    );
  };

  const deleteBlackoutDatesPopup = (status) => (
    <Card className="rounded mb-3 p-1">
      <Card.Body>
        <div className="text-primary-500 mb-2 h4">
          {status === constants.ACTIVE
            ? intl.formatMessage(messages.activeBlackoutDatesDeletionLabel)
            : intl.formatMessage(messages.blackoutDatesDeletionLabel)}
        </div>
        <Card.Text className="text-justify text-muted">
          {intl.formatMessage(deleteHelperText[blackoutDate.status])}
        </Card.Text>
        <div className="d-flex justify-content-end">
          <Button variant="tertiary" onClick={() => setShowDeletePopup(false)}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variant="outline-brand" className="ml-2" onClick={onDelete}>
            {intl.formatMessage(messages.deleteButton)}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  const handleToggle = (isOpen) => {
    if (!isOpen && blackoutDatesHasError) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  };

  return (
    <>
      {
        showDeletePopup ? (
          deleteBlackoutDatesPopup(blackoutDate.status)
        ) : (
          <Collapsible.Advanced
            className="collapsible-card rounded mb-3 px-3"
            onToggle={handleToggle}
            open={collapseIsOpen}
            defaultOpen={blackoutDatesHasError}
            data-testid={blackoutDate.id}
          >
            <Collapsible.Trigger
              className="collapsible-trigger d-flex border-0"
              style={{ justifyContent: 'unset' }}
            >
              <Collapsible.Visible whenClosed>
                {getHeading(false)}
                <div className="ml-auto">
                  <IconButton
                    alt={intl.formatMessage(messages.expandAltText)}
                    src={ExpandMore}
                    iconAs={Icon}
                    onClick={() => {}}
                    variant="dark"
                  />
                </div>
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                {getHeading(true)}
                <div className="pr-4 border-right">
                  <IconButton
                    onClick={() => setShowDeletePopup(true)}
                    alt={intl.formatMessage(messages.deleteBlackoutDatesAltText)}
                    src={Delete}
                    iconAs={Icon}
                    variant="dark"
                  />
                </div>
                <div className="pl-4">
                  <IconButton
                    alt={intl.formatMessage(messages.collapseAltText)}
                    src={ExpandLess}
                    iconAs={Icon}
                    onClick={() => onCollapse()}
                    variant="dark"
                  />
                </div>
              </Collapsible.Visible>
            </Collapsible.Trigger>
            <Collapsible.Body className="collapsible-body rounded px-0">
              <Form.Row className="mx-2 pt-3">
                <BlackoutDatesInput
                  index={index}
                  value={blackoutDate.startDate}
                  type="date"
                  label="Start date"
                  helpText={intl.formatMessage(messages.blackoutStartDateHelp)}
                  fieldName="startDate"
                  formGroupClasses="pl-md-0"
                  fieldClasses="pr-md-2"
                />
                <BlackoutDatesInput
                  index={index}
                  value={blackoutDate.startTime}
                  type="time"
                  label="Start time (optional)"
                  helpText={intl.formatMessage(messages.blackoutStartTimeHelp)}
                  fieldName="startTime"
                  formGroupClasses="pr-md-0"
                  fieldClasses="ml-md-2"
                  helperClasses="ml-md-2"
                />
              </Form.Row>
              <hr className="mx-2 my-2 border-light-400" />
              <Form.Row className="mx-2 pt-4">
                <BlackoutDatesInput
                  index={index}
                  value={blackoutDate.endDate}
                  type="date"
                  label="End date"
                  helpText={intl.formatMessage(messages.blackoutEndDateHelp)}
                  fieldName="endDate"
                  formGroupClasses="pl-md-0"
                  fieldClasses="pr-md-2"
                />
                <BlackoutDatesInput
                  index={index}
                  value={blackoutDate.endTime}
                  type="time"
                  label="End time (optional)"
                  helpText={intl.formatMessage(messages.blackoutEndTimeHelp)}
                  fieldName="endTime"
                  formGroupClasses="pr-md-0"
                  fieldClasses="ml-md-2"
                  helperClasses="ml-md-2"
                />
              </Form.Row>
            </Collapsible.Body>
          </Collapsible.Advanced>
        )
      }
    </>
  );
};

BlackoutDatesItem.propTypes = {
  intl: intlShape.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired,
  blackoutDate: PropTypes.shape({
    id: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default injectIntl(BlackoutDatesItem);
