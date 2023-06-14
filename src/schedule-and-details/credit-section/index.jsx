import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

const CreditSection = ({ intl, creditRequirements }) => {
  const CREDIT_REQUIREMENTS_TYPES = {
    grade: intl.formatMessage(messages.creditMinimumGrade),
    proctoredExam: intl.formatMessage(messages.creditProctoredExam),
    reverification: intl.formatMessage(messages.creditVerification),
  };

  const renderRequirementValue = (requirementValue, key) => {
    const displayValue = key === 'grade'
      ? `${(parseFloat(requirementValue.criteria.minGrade) || 0) * 100}%`
      : requirementValue.displayName;
    return (
      <span className="small" key={requirementValue.name}>
        {displayValue}
      </span>
    );
  };

  const renderCreditRequirements = (requirements) => {
    const creditRequirementsKeys = Object.keys(requirements);

    if (creditRequirementsKeys.length) {
      return (
        <ul className="credit-info-list">
          {creditRequirementsKeys.map((key) => (
            <li className="d-grid" key={key}>
              <h4 className="text-gray-700">
                {CREDIT_REQUIREMENTS_TYPES[key]}
              </h4>
              <div className="d-flex flex-column">
                {creditRequirements[key].map((value) => renderRequirementValue(value, key))}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    return <p>{intl.formatMessage(messages.creditNotFound)}</p>;
  };

  return (
    <section className="section-container credit-section">
      <header className="section-header">
        <span className="lead">{intl.formatMessage(messages.creditTitle)}</span>
        <span className="x-small text-gray-700">
          {intl.formatMessage(messages.creditDescription)}
        </span>
      </header>
      <span>{intl.formatMessage(messages.creditHelp)}</span>
      {renderCreditRequirements(creditRequirements)}
    </section>
  );
};

const creditRequirementsNamespace = PropTypes.shape({
  name: PropTypes.string,
  display_name: PropTypes.string,
  criteria: PropTypes.shape({
    min_grade: PropTypes.number,
  }),
});

const creditRequirementsPropTypes = PropTypes.shape({
  proctoredExam: PropTypes.arrayOf(creditRequirementsNamespace),
  grade: PropTypes.arrayOf(creditRequirementsNamespace),
  reverification: PropTypes.arrayOf(creditRequirementsNamespace),
});

CreditSection.defaultProps = {
  creditRequirements: undefined,
};

CreditSection.propTypes = {
  intl: intlShape.isRequired,
  creditRequirements: creditRequirementsPropTypes,
};

export default injectIntl(CreditSection);
