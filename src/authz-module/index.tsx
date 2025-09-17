import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '@src/generic/Loading';
import LibrariesAuthZManager from './libraries-manager/LibrariesAuthZManager';
import './index.scss';

const AuthZModule = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/libraries/:libraryId" element={<LibrariesAuthZManager />} />
    </Routes>
  </Suspense>
);

export default AuthZModule;
