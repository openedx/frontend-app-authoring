import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Dropdown } from '@edx/paragon';

import messages from './messages';

const DetailsSection = ({
  intl, language, languageOptions, onChange,
}) => {
  const formattedLanguage = () => {
    const result = languageOptions.find((arr) => arr[0] === language);
    return result ? result[1] : intl.formatMessage(messages.dropdownEmpty);
  };

  return (
    <section className="section-container details-section">
      <header className="section-header">
        <span className="lead">
          {intl.formatMessage(messages.detailsTitle)}
        </span>
        <span className="x-small text-gray-700">
          {intl.formatMessage(messages.detailsDescription)}
        </span>
      </header>
      <Form.Group className="dropdown-custom dropdown-language">
        <Form.Label>{intl.formatMessage(messages.dropdownLabel)}</Form.Label>
        <Dropdown>
          <Dropdown.Toggle id="languageDropdown">
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
  intl: intlShape.isRequired,
  language: PropTypes.string,
  languageOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(DetailsSection);
