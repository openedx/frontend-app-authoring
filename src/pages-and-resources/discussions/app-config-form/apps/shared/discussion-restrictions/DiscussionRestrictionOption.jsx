import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';

const DiscussionRestrictionOption = ({
  value,
  label,
  onClick,
  selectedOption,
}) => (
  <Button
    variant="plain"
    className={`w-100 font-size-14 line-height-20 border border-light-400 rounded-0
     ${selectedOption === value ? 'text-white bg-primary-500' : 'unselected-button'}`}
    onClick={() => onClick(value)}
    style={{ padding: '8px 12px', fontWeight: 500 }}
  >{label}
  </Button>
  );

DiscussionRestrictionOption.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  selectedOption: PropTypes.string.isRequired,
};

export default React.memo(DiscussionRestrictionOption);
