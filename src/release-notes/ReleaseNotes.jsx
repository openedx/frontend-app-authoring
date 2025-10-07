import React from 'react';
import { StudioFooterSlot } from '@edx/frontend-component-footer';

import Header from '../header';

const ReleaseNotes = () => (
  <>
    <Header isHiddenMainMenu />
    <main className="page-content">
      <h1>Welcome to release-notes!</h1>
    </main>
    <StudioFooterSlot />
  </>
);

export default ReleaseNotes;
