import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons';

import InstructorContainer from './instructor-container';
import SectionSubHeader from '../../generic/section-sub-header';
import messages from './messages';

const InstructorsSection = ({ instructors, onChange }) => {
  const intl = useIntl();
  const newInstructor = {
    bio: '',
    image: '',
    name: '',
    organization: '',
    title: '',
  };

  const handleChange = (value, idx, field) => {
    const updatedInstructors = instructors.map((instructor, index) => {
      if (index === idx) {
        return {
          ...instructor,
          [field]: value,
        };
      }
      return instructor;
    });

    const updatedInstructorInfo = {
      instructors: updatedInstructors,
    };
    onChange(updatedInstructorInfo, 'instructorInfo');
  };

  const handleDelete = (idx) => {
    const updatedInstructorInfo = {
      instructors: [...instructors],
    };
    updatedInstructorInfo.instructors.splice(idx, 1);
    onChange(updatedInstructorInfo, 'instructorInfo');
  };

  const handleAdd = () => {
    const updatedInstructorInfo = {
      instructors: [...instructors, newInstructor],
    };

    onChange(updatedInstructorInfo, 'instructorInfo');
  };

  return (
    <section className="section-container instructors-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.instructorsTitle)}
        description={intl.formatMessage(messages.instructorsDescription)}
      />
      <ul className="instructors-list">
        {instructors.map((instructor, idx) => (
          <InstructorContainer
            instructor={instructor}
            key={uuid}
            idx={idx}
            onDelete={handleDelete}
            onChange={handleChange}
          />
        ))}
      </ul>
      <Button iconBefore={AddIcon} variant="primary" onClick={handleAdd}>
        {intl.formatMessage(messages.instructorAdd)}
      </Button>
    </section>
  );
};

InstructorsSection.defaultProps = {
  instructors: [],
};

InstructorsSection.propTypes = {
  instructors: PropTypes.arrayOf(
    PropTypes.shape({
      bio: PropTypes.string,
      image: PropTypes.string,
      name: PropTypes.string,
      organization: PropTypes.string,
      title: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func.isRequired,
};

export default InstructorsSection;
