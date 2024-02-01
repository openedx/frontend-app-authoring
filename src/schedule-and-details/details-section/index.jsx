import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Dropdown } from '@openedx/paragon';

import SectionSubHeader from '../../generic/section-sub-header';
import messages from './messages';

const DetailsSection = ({
  language, languageOptions, onChange,
}) => {
  const intl = useIntl();
  const formattedLanguage = () => {
    const result = languageOptions.find((arr) => arr[0] === language);
    return result ? result[1] : intl.formatMessage(messages.dropdownEmpty);
  };

  return (
    <section className="section-container details-section">
      <SectionSubHeader
        title={intl.formatMessage(messages.detailsTitle)}
        description={intl.formatMessage(messages.detailsDescription)}
      />
      <Form.Group className="form-group-custom dropdown-language">
        <Form.Label>{intl.formatMessage(messages.dropdownLabel)}</Form.Label>
        <Dropdown className="bg-white">
          <Dropdown.Toggle variant="outline-primary" id="languageDropdown">
            {formattedLanguage()}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {languageOptions.map((option) => (
              <Dropdown.Item
                key={option[0]}
                onClick={() => onChange(option[0], 'language')}
              >
                {option[1]}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Form.Control.Feedback>
          {intl.formatMessage(messages.dropdownHelpText)}
        </Form.Control.Feedback>
      </Form.Group>
    </section>
  );
};

DetailsSection.defaultProps = {
  language: '',
};

DetailsSection.propTypes = {
  language: PropTypes.string,
  languageOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DetailsSection;
