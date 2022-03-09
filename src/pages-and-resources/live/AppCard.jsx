import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from '@edx/paragon';
import zoom from '../../assets/images/zoom.svg';

function AppCard({
  app, onClick, selected,
}) {
  return (
    <Card
      onClick={() => onClick()}
      onKeyPress={() => onClick()}
      style={{
        cursor: 'pointer',
        border: '2px solid',
      }}
      className={classNames({
        'border-primary-300': selected,
      }, 'w-100 align-items-center border-primary-100')}
    >
      <Card.Body>
        <Card.Text className="d-flex flex-column align-items-center">
          <img src={zoom} alt={app.id} style={{ width: '48px', height: '48px' }} />
          <span>{app.id}</span>
        </Card.Text>

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
};

export default AppCard;
