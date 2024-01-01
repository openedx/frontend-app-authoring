import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Form } from '@openedx/paragon';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const VisibilityTab = ({ isVisibleToStaffOnly, setIsVisibleToStaffOnly, showWarning }) => {
  const handleChange = (e) => {
    setIsVisibleToStaffOnly(e.target.checked);
  };

  return (
    <>
      <h3 className="mt-3"><FormattedMessage {...messages.sectionVisibility} /></h3>
      <hr />
      <Form.Checkbox checked={isVisibleToStaffOnly} onChange={handleChange} data-testid="visibility-checkbox">
        <FormattedMessage {...messages.hideFromLearners} />
      </Form.Checkbox>
      {showWarning && (
        <>
          <hr />
          <Alert variant="warning">
            <FormattedMessage {...messages.visibilityWarning} />
          </Alert>
        </>

      )}
    </>
  );
};

VisibilityTab.propTypes = {
  isVisibleToStaffOnly: PropTypes.bool.isRequired,
  showWarning: PropTypes.bool.isRequired,
  setIsVisibleToStaffOnly: PropTypes.func.isRequired,
};

export default injectIntl(VisibilityTab);
