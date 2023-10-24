import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import SettingsComponent from './SettingsComponent';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    appId: 'wiki',
  }),
}));

describe('SettingsComponent', () => {
  test('renders LazyLoadedComponent when provided with props', async () => {
    const { asFragment } = render(
      <BrowserRouter>
        <Suspense fallback="...">
          <SettingsComponent url="/some-url" />
        </Suspense>
      </BrowserRouter>,
    );

    expect(asFragment).toMatchSnapshot();
  });
});
