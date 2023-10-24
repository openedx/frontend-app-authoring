import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';

const SettingsComponent = ({ url }) => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const LazyLoadedComponent = React.lazy(async () => {
    try {
      // There seems to be a bug in babel-eslint that causes the checker to crash with the following error
      // if we use a template string here:
      //     TypeError: Cannot read property 'range' of null with using template strings here.
      // Ref: https://github.com/babel/babel-eslint/issues/530
      return await import(`./${appId}/Settings.jsx`);
    } catch (error) {
      console.trace(error); // eslint-disable-line no-console
      return null;
    }
  });

  return <LazyLoadedComponent onClose={() => navigate(url)} />;
};

SettingsComponent.propTypes = {
  url: PropTypes.string.isRequired,
};

export default SettingsComponent;
