import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Input } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';

function DiscussionAppCard({
  app, clickHandler, intl, selected,
}) {
  return (
    <Card
      key={app.id}
      tabIndex={app.isAvailable ? '-1' : ''}
      onClick={() => { if (app.isAvailable) { clickHandler(app.id); } }}
      onKeyPress={() => { if (app.isAvailable) { clickHandler(app.id); } }}
      role="radio"
      aria-checked={selected}
      style={{
        cursor: 'pointer',
      }}
      className={classNames({
        'border-primary': selected,
      })}
    >
      <div
        className="position-absolute"
        style={{
          // This positioning of 0.75rem aligns the checkbox with the top of the logo
          top: '0.75rem',
          right: '0.75rem',
        }}
      >
        {app.isAvailable ? (
          <Input readOnly type="checkbox" checked={selected} />
        ) : (
          <FontAwesomeIcon icon={faLock} />
        )}
      </div>
      <Card.Img
        variant="top"
        style={{
          maxHeight: 100,
          objectFit: 'contain',
        }}
        className="py-3 pl-3 pr-5"
        src={app.logo}
        alt={intl.formatMessage(messages.appLogo, {
          name: app.name,
        })}
      />
      <Card.Body>
        <Card.Title>{app.name}</Card.Title>
        <Card.Text>{app.description}</Card.Text>
      </Card.Body>
      <Card.Footer>
        {app.supportLevel}
      </Card.Footer>
    </Card>
  );
}

DiscussionAppCard.propTypes = {
  app: PropTypes.shape({
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    isAvailable: PropTypes.bool.isRequired,
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    supportLevel: PropTypes.string.isRequired,
  }).isRequired,
  clickHandler: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionAppCard);
