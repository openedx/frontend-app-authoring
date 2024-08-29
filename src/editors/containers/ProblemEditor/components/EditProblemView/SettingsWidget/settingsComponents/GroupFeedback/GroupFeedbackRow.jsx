import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Form, Icon, IconButton, Row,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../../messages';

const GroupFeedbackRow = ({
  value,
  handleAnswersSelectedChange,
  handleFeedbackChange,
  handleDelete,
  answers,
  // injected
  intl,
}) => (

  <div className="mb-4">
    <ActionRow className="mb-2">
      <Form.Control
        value={value.feedback}
        onChange={handleFeedbackChange}
      />
      <div className="d-flex flex-row flex-nowrap">
        <IconButton
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
          onClick={handleDelete}
          variant="primary"
        />
      </div>
    </ActionRow>
    <Form.CheckboxSet
      onChange={handleAnswersSelectedChange}
      value={value.answers}
    >
      <Row className="mx-0">
        {answers.map((letter) => (
          <Form.Checkbox
            className="mr-4 mt-1"
            value={letter.id}
            checked={value.answers.indexOf(letter.id)}
            isValid={value.answers.indexOf(letter.id) >= 0}
          >
            <div className="x-small">
              {letter.id}
            </div>
          </Form.Checkbox>
        ))}
      </Row>
    </Form.CheckboxSet>
  </div>

);

GroupFeedbackRow.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.string,
    selectedFeedback: PropTypes.string,
    title: PropTypes.string,
    unselectedFeedback: PropTypes.string,
  })).isRequired,
  handleAnswersSelectedChange: PropTypes.func.isRequired,
  handleFeedbackChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    answers: PropTypes.arrayOf(PropTypes.string),
    feedback: PropTypes.string,
  }).isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const GroupFeedbackRowInternal = GroupFeedbackRow; // For testing only
export default injectIntl(GroupFeedbackRow);
