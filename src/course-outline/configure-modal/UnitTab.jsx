import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from '@openedx/paragon';
import {
  FormattedMessage, injectIntl, useIntl,
} from '@edx/frontend-platform/i18n';
import { Field } from 'formik';

import messages from './messages';

const UnitTab = ({
  values,
  setFieldValue,
  showWarning,
  userPartitionInfo,
}) => {
  const intl = useIntl();
  const {
    isVisibleToStaffOnly,
    selectedPartitionIndex,
  } = values;

  const handleChange = (e) => {
    setFieldValue('isVisibleToStaffOnly', e.target.checked);
  };

  const handleSelect = (e) => {
    setFieldValue('selectedPartitionIndex', parseInt(e.target.value, 10));
  };

  return (
    <>
      <h3 className="mt-3"><FormattedMessage {...messages.unitVisibility} /></h3>
      <hr />
      <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleChange} data-testid="unit-visibility-checkbox">
        <FormattedMessage {...messages.hideFromLearners} />
      </Form.Checkbox>
      {showWarning && (
        <Alert className="mt-2" variant="warning">
          <FormattedMessage {...messages.unitVisibilityWarning} />
        </Alert>
      )}
      <hr />
      <Form.Group controlId="groupSelect">
        <Form.Label as="legend" className="font-weight-bold">
          <FormattedMessage {...messages.restrictAccessTo} />
        </Form.Label>
        <Form.Control
          as="select"
          name="groupSelect"
          value={selectedPartitionIndex}
          onChange={handleSelect}
          data-testid="group-type-select"
        >
          <option value="-1" key="-1">
            {userPartitionInfo.selectedPartitionIndex === -1
              ? intl.formatMessage(messages.unitSelectGroupType)
              : intl.formatMessage(messages.unitAllLearnersAndStaff)}
          </option>
          {userPartitionInfo.selectablePartitions.map((partition, index) => (
            <option
              key={partition.id}
              value={index}
            >
              {partition.name}
            </option>
          ))}
        </Form.Control>

        {selectedPartitionIndex >= 0 && userPartitionInfo.selectablePartitions.length && (
          <Form.Group controlId="select-groups-checkboxes">
            <Form.Label><FormattedMessage {...messages.unitSelectGroup} /></Form.Label>
            <div
              role="group"
              className="d-flex flex-column"
              data-testid="group-checkboxes"
              aria-labelledby="select-groups-checkboxes"
            >
              {userPartitionInfo.selectablePartitions[selectedPartitionIndex].groups.map((group) => (
                <Form.Group
                  key={group.id}
                  className="pgn__form-checkbox"
                >
                  <Field
                    as={Form.Control}
                    className="flex-grow-0 mr-1"
                    controlClassName="pgn__form-checkbox-input mr-1"
                    type="checkbox"
                    value={`${group.id}`}
                    name="selectedGroups"
                  />
                  <Form.Label isInline>
                    {group.name}
                  </Form.Label>
                </Form.Group>
              ))}
            </div>
          </Form.Group>
        )}
      </Form.Group>

    </>
  );
};

UnitTab.propTypes = {
  values: PropTypes.shape({
    isVisibleToStaffOnly: PropTypes.bool.isRequired,
    selectedPartitionIndex: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  showWarning: PropTypes.bool.isRequired,
  userPartitionInfo: PropTypes.shape({
    selectablePartitions: PropTypes.arrayOf(PropTypes.shape({
      groups: PropTypes.arrayOf(PropTypes.shape({
        deleted: PropTypes.bool.isRequired,
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        selected: PropTypes.bool.isRequired,
      }).isRequired).isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      scheme: PropTypes.string.isRequired,
    }).isRequired).isRequired,
    selectedGroupsLabel: PropTypes.string,
    selectedPartitionIndex: PropTypes.number.isRequired,
  }).isRequired,
};

export default injectIntl(UnitTab);
