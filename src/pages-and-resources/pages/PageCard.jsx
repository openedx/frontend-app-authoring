import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import messages from '../messages';

const pageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  showSettings: PropTypes.bool.isRequired,
  showStatus: PropTypes.bool.isRequired,
  showEnable: PropTypes.bool.isRequired,
});

function PageCard({ intl, coursePage }) {
  const pageStatusMsgId = coursePage.isEnabled ? 'pageStatus.enabled' : 'pageStatus.disabled';
  const componentClasses = classNames(
    'course-page-config-card d-flex flex-column align-content-stretch',
    'bg-white p-3 border shadow',
    { 'border-info-300': coursePage.isEnabled, 'border-gray-100': !coursePage.isEnabled },
  );

  return (
    <div className={componentClasses}>
      <div className="d-flex flex-row">
        <span className="font-weight-bold">{coursePage.title}</span>
        {coursePage.showSettings && <FontAwesomeIcon icon={faCog} className="ml-auto" />}
      </div>

      <div>
        {coursePage.showStatus && <span>{intl.formatMessage(messages[pageStatusMsgId])}</span>}
      </div>

      <div className="mt-3">
        <p>{coursePage.description}</p>
      </div>

      {coursePage.showEnable && !coursePage.isEnabled && (
        <div className="d-flex justify-content-center">
          <Button variant="outline-primary">
            {intl.formatMessage(messages['enable.button'])}
          </Button>
        </div>
      )}
    </div>
  );
}

PageCard.propTypes = {
  intl: intlShape.isRequired,
  coursePage: pageShape.isRequired,
};

export default injectIntl(PageCard);
