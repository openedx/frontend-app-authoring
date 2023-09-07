import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import SectionSubHeader from '../../generic/section-sub-header';
import messages from './messages';

const CreditSection = ({ creditRequirements }) => {
  const intl = useIntl();

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
      <span className="small text-black" key={requirementValue.name}>
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
            <li key={key}>
              <h4 className="mb-0 text-black">
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
      <SectionSubHeader
        title={intl.formatMessage(messages.creditTitle)}
        description={intl.formatMessage(messages.creditDescription)}
      />
      <p className="credit-help-text">{intl.formatMessage(messages.creditHelp)}</p>
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
  creditRequirements: creditRequirementsPropTypes,
};

export default CreditSection;
