import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Button } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import SectionSubHeader from '../../generic/section-sub-header';
import messages from './messages';

const LearningOutcomesSection = ({ learningInfo, onChange }) => {
  const intl = useIntl();

  const handleInputChange = (value, index) => {
    const updatedInfo = [...learningInfo];
    updatedInfo[index] = value;
    onChange(updatedInfo, 'learningInfo');
  };

  const handleDelete = (index) => {
    const updatedInfo = [...learningInfo];
    updatedInfo.splice(index, 1);
    onChange(updatedInfo, 'learningInfo');
  };

  const handleAdd = () => {
    const updatedInfo = [...learningInfo, ''];
    onChange(updatedInfo, 'learningInfo');
  };

  const renderLearningOutcomeItem = (text, idx) => (
    <Form.Group
      className="form-group-custom align-items-center d-flex"
      key={idx}
    >
      <Form.Label isInline>
        {intl.formatMessage(messages.outcomesLabelIncrement)} {idx + 1}
      </Form.Label>
      <Form.Control
        value={text}
        placeholder={intl.formatMessage(messages.outcomesInputPlaceholder)}
        onChange={(e) => handleInputChange(e.target.value, idx)}
      />
      <Button
        variant="outline-primary"
        onClick={() => handleDelete(idx)}
      >
        {intl.formatMessage(messages.outcomesDelete)}
      </Button>
    </Form.Group>
  );

  return (
    <section className="section-container learning-outcomes-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.outcomesTitle)}
        description={intl.formatMessage(messages.outcomesDescription)}
      />
      <ul className="learning-outcomes-list">
        {learningInfo.map(renderLearningOutcomeItem)}
      </ul>
      <Button iconBefore={AddIcon} variant="primary" onClick={handleAdd}>
        {intl.formatMessage(messages.outcomesAdd)}
      </Button>
    </section>
  );
};

LearningOutcomesSection.defaultProps = {
  learningInfo: [],
};

LearningOutcomesSection.propTypes = {
  learningInfo: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default LearningOutcomesSection;
