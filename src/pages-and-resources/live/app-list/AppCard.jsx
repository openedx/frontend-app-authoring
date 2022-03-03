import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, CheckboxControl } from '@edx/paragon';
import messages from './messages';

function AppCard({
  app, onClick, intl, selected,
}) {
  return (
    <Card
      tabIndex="-1"
      onClick={() => onClick(app.id)}
      onKeyPress={() => onClick(app.id)}
      role="radio"
      aria-checked={selected}
      style={{
        cursor: 'pointer',
      }}
      className={classNames({
        'border-primary': selected,
      }, 'w-100')}
    >
      <div
        className="position-absolute mt-3 mr-3"
        style={{
          top: '0.75rem',
          right: '0.75rem',
        }}
      >
        <CheckboxControl
          checked={selected}
          readOnly
          aria-label={intl.formatMessage(messages.selectApp, {
            appName: intl.formatMessage(messages[`appName-${app.id}`]),
          })}
        />
      </div>
      <Card.Body>
        <div className="h4 card-title">
          {intl.formatMessage(messages[`appName-${app.id}`])}
        </div>
        <Card.Text>{intl.formatMessage(messages[`appDescription-${app.id}`])}</Card.Text>
      </Card.Body>
    </Card>
  );
}

AppCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(AppCard);
