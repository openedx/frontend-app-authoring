import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '@src/generic/Loading';
import ErrorBoundary from '@src/editors/sharedComponents/ErrorBoundary';
import LibrariesAuthZManager from './libraries-manager/LibrariesAuthZManager';
import { MODULE_PATH } from './constants';

import './index.scss';

const AuthZModule = () => (
  <ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={MODULE_PATH} element={<LibrariesAuthZManager />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AuthZModule;
