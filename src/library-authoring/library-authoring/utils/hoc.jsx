import React from 'react';

import {
  useParams, useNavigate, useLocation, matchRoutes,
} from 'react-router-dom';
import { ROUTES } from '../common';

const routes = [
  { path: ROUTES.Block.HOME },
  { path: ROUTES.Block.EDIT },
  { path: ROUTES.Block.ASSETS },
  { path: ROUTES.Block.SOURCE },
  { path: ROUTES.Block.LEARN },
];

export const withParams = WrappedComponent => {
  const WithParamsComponent = props => <WrappedComponent {...useParams()} {...props} />;
  return WithParamsComponent;
};

export const withNavigate = Component => {
  const WrappedComponent = props => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
  return WrappedComponent;
};

export const withPath = Component => {
  const WrappedComponent = props => {
    const location = useLocation();
    const [{ route }] = matchRoutes(routes, location);

    return <Component {...props} path={route.path} />;
  };
  return WrappedComponent;
};
