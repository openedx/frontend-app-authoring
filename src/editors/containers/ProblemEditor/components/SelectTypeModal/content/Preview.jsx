import React from 'react';
import PropTypes from 'prop-types';
import { ProblemTypes } from '../../../../../data/constants/problem';

const Preview = ({
  problemType,
}) => {
  if (problemType === null) {
    return null;
  }
  const data = ProblemTypes[problemType];
  return (
    <div>
      <div>
        <p>{data.title}</p>
      </div>
      <div>
        {data.preview}
      </div>
      <div>
        <p>{data.description}</p>
      </div>
      <div>
        <p>{data.helpLink}</p>
      </div>
    </div>
  );
};

Preview.defaultProps = {
  problemType: null,
};
Preview.propTypes = {
  problemType: PropTypes.string,
};

export default Preview;
