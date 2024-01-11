import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from '@edx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const UnitTab = ({
  intl,
  isVisibleToStaffOnly,
  setIsVisibleToStaffOnly,
  showWarning,
  userPartitionInfo,
  setSelectedPartitionIndex,
  selectedPartitionIndex,
  selectedGroups,
  add,
  remove,
}) => {
  const handleChange = (e) => {
    setIsVisibleToStaffOnly(e.target.checked);
  };

  const handleSelect = (e) => {
    setSelectedPartitionIndex(parseInt(e.target.value, 10));
  };

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      add(e.target.value);
    } else {
      remove(e.target.value);
    }
  };
  return (
    <>
      <h3 className="mt-3"><FormattedMessage {...messages.unitVisibility} /></h3>
      <hr />
      <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleChange} data-testid="unit-visibility-checkbox">
        <FormattedMessage {...messages.hideFromLearners} />
      </Form.Checkbox>
      {showWarning && (
        <Alert variant="warning">
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
          <Form.Group>
            <Form.Label><FormattedMessage {...messages.unitSelectGroup} /></Form.Label>
            <Form.CheckboxSet
              name="groups"
              onChange={handleCheckBoxChange}
              value={selectedGroups}
              data-testid="group-checkboxes"
            >
              {userPartitionInfo.selectablePartitions[selectedPartitionIndex].groups.map((group) => (<Form.Checkbox key={group.id} value={`${group.id}`}>{group.name}</Form.Checkbox>))}
            </Form.CheckboxSet>
          </Form.Group>
        )}
      </Form.Group>

    </>
  );
};

UnitTab.propTypes = {
  intl: intlShape.isRequired,
  isVisibleToStaffOnly: PropTypes.bool.isRequired,
  setIsVisibleToStaffOnly: PropTypes.func.isRequired,
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
    selectedGroupsLabel: PropTypes.string.isRequired,
    selectedPartitionIndex: PropTypes.number.isRequired,
  }).isRequired,
  setSelectedPartitionIndex: PropTypes.func.isRequired,
  selectedPartitionIndex: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  selectedGroups: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
  add: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

export default injectIntl(UnitTab);
