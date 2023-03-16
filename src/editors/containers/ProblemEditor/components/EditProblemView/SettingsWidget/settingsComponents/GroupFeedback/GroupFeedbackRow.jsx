import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Container, Form, Icon, IconButton, Row,
} from '@edx/paragon';
import { DeleteOutline } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../../messages';
import ExpandableTextArea from '../../../../../../../sharedComponents/ExpandableTextArea';

export const GroupFeedbackRow = ({
  value,
  handleAnswersSelectedChange,
  handleFeedbackChange,
  handleDelete,
  answers,
  id,
  // injected
  intl,
}) => (

  <div className="mb-4">
    <ActionRow className="mb-2">
      <Container fluid className="p-0">
        <ExpandableTextArea
          value={value.feedback}
          onChange={handleFeedbackChange}
          id={`groupFeedback-${id}`}
        />
      </Container>
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
        onClick={handleDelete}
        variant="primary"
      />
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
          >{letter.id}
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
  id: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(GroupFeedbackRow);
