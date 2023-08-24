import React from 'react';
import PropTypes from 'prop-types';

const SubHeader = ({
  title, subtitle, contentTitle, description, instruction, headerActions,
}) => (
  <>
    <header className="sub-header">
      <h2 className="sub-header-title">
        <small className="sub-header-title-subtitle">{subtitle}</small>
        {title}
      </h2>
      {headerActions && (
        <div className="ml-auto sub-header-actions">
          {headerActions}
        </div>
      )}
    </header>
    <header className="sub-header-content">
      <h2 className="sub-header-content-title">{contentTitle}</h2>
      <span className="small text-gray-700">{description}</span>
    </header>
    {instruction && (
      <p className="sub-header-instructions mb-4">{instruction}</p>
    )}
  </>
);
SubHeader.defaultProps = {
  instruction: '',
  description: '',
  headerActions: null,
};
SubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  contentTitle: PropTypes.string.isRequired,
  description: PropTypes.string,
  instruction: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  headerActions: PropTypes.node,
};
export default SubHeader;
