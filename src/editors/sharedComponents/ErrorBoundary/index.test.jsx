import React from 'react';
import { render } from '@testing-library/react';

import {
  logError,
} from '@edx/frontend-platform/logging';
import ErrorBoundary from './index';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// stubbing this to avoid needing to inject a stubbed intl into an internal component
jest.mock('./ErrorPage', () => function mockErrorPage() {
  return <p>Error Page</p>;
});

describe('ErrorBoundary', () => {
  it('should render children if no error', () => {
    const component = (
      <ErrorBoundary>
        <div>Yay</div>
      </ErrorBoundary>
    );
    const { container } = render(component);
    const element = container.querySelector('div');

    expect(logError).toHaveBeenCalledTimes(0);
    expect(element.textContent).toEqual('Yay');
  });

  it('should render ErrorPage if it has an error', () => {
    const ExplodingComponent = () => {
      throw new Error('booyah');
    };
    const component = (
      <ErrorBoundary>
        <ExplodingComponent />
      </ErrorBoundary>
    );
    const { container } = render(component);
    const element = container.querySelector('p');
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      new Error('booyah'),
      expect.objectContaining({
        stack: expect.stringContaining('ExplodingComponent'),
      }),
    );
    expect(element.textContent).toEqual('Error Page');
  });
});
