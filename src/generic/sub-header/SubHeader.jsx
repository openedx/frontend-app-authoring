import React from 'react';
import PropTypes from 'prop-types';
import { ActionRow } from '@edx/paragon';

const SubHeader = ({
  title,
  subtitle,
  contentTitle,
  description,
  instruction,
  headerActions,
  titleActions,
  hideBorder,
}) => (
  <div className={`${!hideBorder && 'border-bottom border-light-400'} mb-3`}>
    <header className="sub-header">
      <h2 className="sub-header-title">
        <small className="sub-header-title-subtitle">{subtitle}</small>
        {title}
        {titleActions && (
          <ActionRow className="ml-auto">
            {titleActions}
          </ActionRow>
        )}
      </h2>
      {headerActions && (
        <ActionRow className="ml-auto sub-header-actions">
          {headerActions}
        </ActionRow>
      )}
    </header>
    {contentTitle && (
      <header className="sub-header-content">
        <h2 className="sub-header-content-title">{contentTitle}</h2>
        <span className="small text-gray-700">{description}</span>
      </header>
    )}
    {instruction && (
      <p className="sub-header-instructions mb-4">{instruction}</p>
    )}
  </div>
);
SubHeader.defaultProps = {
  instruction: '',
  description: '',
  subtitle: '',
  contentTitle: '',
  headerActions: null,
  titleActions: null,
  hideBorder: false,
};
SubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  contentTitle: PropTypes.string,
  description: PropTypes.string,
  instruction: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
  ]),
  headerActions: PropTypes.node,
  titleActions: PropTypes.node,
  hideBorder: PropTypes.bool,
};
export default SubHeader;
