import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { Button, Form, FormLabel } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import TypeaheadDropdown from '../../editors/sharedComponents/TypeaheadDropdown';
import { getOrganizations } from '../../generic/data/selectors';
import { fetchOrganizationsQuery } from '../../generic/data/thunks';
import messages from '../messages';

const OrganizationSection = ({ intl }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const fieldName = 'org';
  const searchParams = new URLSearchParams(location.search);
  const orgURLValue = searchParams.get(fieldName) || '';
  const [inputValue, setInputValue] = useState('');
  const organizations = useSelector(getOrganizations);

  useEffect(() => {
    if (isEmpty(organizations)) {
      dispatch(fetchOrganizationsQuery());
    }
  }, []);

  // We have to set value only after the list of organizations to be received to display the initial state correctly.
  useEffect(() => {
    if (organizations.length) {
      setInputValue(orgURLValue);
    }
  }, [orgURLValue, organizations]);

  const handleSubmit = () => {
    navigate({
      pathname: '/home',
      search: `?${fieldName}=${inputValue}`,
    });
  };

  return (
    <div className="organization-section">
      <h3 className="organization-section-title">
        {intl.formatMessage(messages.organizationTitle)}
      </h3>
      <Form.Group className="organization-section-form d-flex align-items-baseline">
        <FormLabel isInline className="organization-section-form-label">
          {intl.formatMessage(messages.organizationLabel)}
        </FormLabel>
        <TypeaheadDropdown
          readOnly={false}
          name="organizationSearch"
          value={inputValue}
          options={organizations}
          placeholder={intl.formatMessage(messages.organizationInputPlaceholder)}
          handleBlur={(e) => setInputValue(e.target.value)}
          handleChange={(value) => setInputValue(value)}
          noOptionsMessage={intl.formatMessage(messages.organizationInputNoOptions)}
          helpMessage=""
          errorMessage=""
          floatingLabel=""
        />
      </Form.Group>
      <Button onClick={handleSubmit}>
        {intl.formatMessage(messages.organizationSubmitBtnText)}
      </Button>
    </div>
  );
};

OrganizationSection.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OrganizationSection);
