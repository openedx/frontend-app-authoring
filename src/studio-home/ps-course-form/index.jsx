import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import { CreateOrRerunCourseForm } from '../../generic/create-or-rerun-course';
import messages from './messages';

const PSCourseForm = ({ handleOnClickCancel }) => {
    const intl = useIntl();
    const initialPSCourseData = {
        displayName: '',
        org: '',
        number: '',
        run: '',
    };

    return (
        <div className="mb-4.5" data-testid="ps-course-form">
            <CreateOrRerunCourseForm
                title={intl.formatMessage(messages.createPSCourse)}
                initialValues={initialPSCourseData}
                onClickCancel={handleOnClickCancel}
                isCreateNewCourse
            />
        </div>
    );
};

PSCourseForm.propTypes = {
    handleOnClickCancel: PropTypes.func.isRequired,
};

export default PSCourseForm;

export { default } from './PSCourseForm'; 