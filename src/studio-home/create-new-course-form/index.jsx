import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import { CreateOrRerunCourseForm } from '../../generic/create-or-rerun-course';
import messages from './messages';

const CreateNewCourseForm = ({ handleOnClickCancel }) => {
  const intl = useIntl();
  const initialNewCourseData = {
    displayName: '',
    org: '',
    number: '',
    run: '',
  };

  return (
    <div className="mb-4.5" data-testid="create-course-form">
      <CreateOrRerunCourseForm
        title={intl.formatMessage(messages.createNewCourse)}
        initialValues={initialNewCourseData}
        onClickCancel={handleOnClickCancel}
        isCreateNewCourse
      />
    </div>
  );
};

CreateNewCourseForm.propTypes = {
  handleOnClickCancel: PropTypes.func.isRequired,
};

export default CreateNewCourseForm;
