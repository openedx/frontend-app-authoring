import { Alert, Form } from '@openedx/paragon';
import {
  FormattedMessage, useIntl,
} from '@edx/frontend-platform/i18n';
import { Field } from 'formik';
import classNames from 'classnames';

import { COURSE_BLOCK_NAMES } from '../../constants';
import messages from './messages';

export type UserPartitionInfo = {
  selectablePartitions: {
    groups: {
      deleted: boolean,
      id: number,
      name: string,
      selected: boolean,
    }[],
    id: number,
    name: string,
    scheme: string,
  }[],
  selectedGroupsLabel?: string,
  selectedPartitionIndex: number,
};

export interface UnitTabProps {
  isXBlockComponent: boolean,
  category?: string,
  values: {
    isVisibleToStaffOnly: boolean,
    discussionEnabled: boolean,
    selectedPartitionIndex: number,
    selectedGroups: string[],
  },
  setFieldValue: (key: string, value: any) => void,
  showWarning: boolean,
  userPartitionInfo: UserPartitionInfo,
}

export const DiscussionEditComponent = ({
  discussionEnabled,
  handleDiscussionChange,
}: {
  discussionEnabled: boolean,
  handleDiscussionChange: (e: any) => void,
}) => (
  <>
    <Form.Checkbox checked={discussionEnabled} onChange={handleDiscussionChange}>
      <FormattedMessage {...messages.discussionEnabledCheckbox} />
    </Form.Checkbox>
    <p className="x-small font-weight-bold"><FormattedMessage {...messages.discussionEnabledDescription} /></p>
  </>
);

export interface AccessEditComponentProps {
  selectedPartitionIndex: number,
  setFieldValue: (key: string, value: any) => void,
  userPartitionInfo: UserPartitionInfo,
  selectedGroups: string[],
}

export const AccessEditComponent = ({
  selectedPartitionIndex,
  setFieldValue,
  userPartitionInfo,
  selectedGroups,
}: AccessEditComponentProps) => {
  const intl = useIntl();
  const checkIsDeletedGroup = (group) => {
    const isGroupSelected = selectedGroups.includes(group.id.toString());

    return group.deleted && isGroupSelected;
  };

  const handleSelect = (e) => {
    setFieldValue('selectedPartitionIndex', parseInt(e.target.value, 10));
    setFieldValue('selectedGroups', selectedGroups);
  };

  return (
    <>
      <Form.Label className="font-weight-bold">
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
                <div>
                  <Form.Label
                    className={classNames({ 'text-danger': checkIsDeletedGroup(group) })}
                    isInline
                  >
                    {group.name}
                  </Form.Label>
                  {/* istanbul ignore next */ group.deleted && (
                    <Form.Control.Feedback type="invalid" hasIcon={false}>
                      <FormattedMessage {...messages.unitSelectDeletedGroupErrorMessage} />
                    </Form.Control.Feedback>
                  )}
                </div>
              </Form.Group>
            ))}
          </div>
        </Form.Group>
      )}
    </>
  );
};

export const UnitTab = ({
  isXBlockComponent,
  category,
  values,
  setFieldValue,
  showWarning,
  userPartitionInfo,
}: UnitTabProps) => {
  const {
    isVisibleToStaffOnly,
    selectedPartitionIndex,
    selectedGroups,
    discussionEnabled,
  } = values;

  const handleVisibilityChange = (e) => {
    setFieldValue('isVisibleToStaffOnly', e.target.checked);
  };

  const handleDiscussionChange = (e) => {
    setFieldValue('discussionEnabled', e.target.checked);
  };

  const getAccessBlockTitle = () => {
    switch (category) {
      case COURSE_BLOCK_NAMES.libraryContent.id:
        return messages.libraryContentAccess;
      case COURSE_BLOCK_NAMES.splitTest.id:
        return messages.splitTestAccess;
      default:
        return messages.unitAccess;
    }
  };

  return (
    <>
      {!isXBlockComponent && (
        <>
          <h4 className="mt-3"><FormattedMessage {...messages.unitVisibility} /></h4>
          <hr />
          <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleVisibilityChange} data-testid="unit-visibility-checkbox">
            <FormattedMessage {...messages.hideFromLearners} />
          </Form.Checkbox>
          {/* istanbul ignore next */ showWarning && (
            <Alert className="mt-2" variant="warning">
              <FormattedMessage {...messages.unitVisibilityWarning} />
            </Alert>
          )}
        </>
      )}
      {userPartitionInfo.selectablePartitions.length > 0 && (
        <Form.Group controlId="groupSelect">
          <h4 className="mt-3">
            <FormattedMessage {...getAccessBlockTitle()} />
          </h4>
          <hr />
          <AccessEditComponent
            selectedPartitionIndex={selectedPartitionIndex}
            setFieldValue={setFieldValue}
            userPartitionInfo={userPartitionInfo}
            selectedGroups={selectedGroups}
          />
        </Form.Group>
      )}
      {!isXBlockComponent && (
        <>
          <h4 className="mt-4"><FormattedMessage {...messages.discussionEnabledSectionTitle} /></h4>
          <hr />
          <DiscussionEditComponent
            discussionEnabled={discussionEnabled}
            handleDiscussionChange={handleDiscussionChange}
          />
        </>
      )}
    </>
  );
};
