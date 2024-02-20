import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Icon } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { capitalize } from 'lodash';

import { transformKeysToCamelCase } from '../../utils';

const ModalErrorListItem = ({ settingName, settingsData }) => {
  const { displayName } = settingsData[transformKeysToCamelCase(settingName)];
  return (
    <li className="modal-error-item">
      <Alert variant="danger">
        <h4 className="modal-error-item-title">
          <Icon src={Error} />{capitalize(displayName)}:
        </h4>
        <p className="m-0">{settingName.message}</p>
      </Alert>
    </li>
  );
};

ModalErrorListItem.propTypes = {
  settingName: PropTypes.shape({
    key: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
  settingsData: PropTypes.shape({}).isRequired,
};

export default ModalErrorListItem;
