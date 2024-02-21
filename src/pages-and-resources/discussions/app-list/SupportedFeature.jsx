import React from 'react';
import PropTypes from 'prop-types';
import { Check } from '@openedx/paragon/icons';

const SupportedFeature = ({ name }) => (
  <>
    <span className="mr-3">
      <Check id="check-icon" className="text-success-500" />
    </span>
    {name}
  </>
);

SupportedFeature.propTypes = {
  name: PropTypes.string.isRequired,
};

export default SupportedFeature;
