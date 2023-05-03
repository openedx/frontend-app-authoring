import React from 'react';
import { mount } from 'enzyme';

import {
  logError,
} from '@edx/frontend-platform/logging';
import ErrorBoundary from './index';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// stubbing this to avoid needing to inject a stubbed intl into an internal component
jest.mock('./ErrorPage', () => () => <p>Error Page</p>);

describe('ErrorBoundary', () => {
  it('should render children if no error', () => {
    const component = (
      <ErrorBoundary>
        <div>Yay</div>
      </ErrorBoundary>
    );
    const wrapper = mount(component);
    const element = wrapper.find('div');

    expect(logError).toHaveBeenCalledTimes(0);
    expect(element.text()).toEqual('Yay');
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
    const wrapper = mount(component);
    const element = wrapper.find('p');
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('booyah'), { stack: '\n    in ExplodingComponent\n    in ErrorBoundary (created by WrapperComponent)\n    in WrapperComponent' });
    expect(element.text()).toEqual('Error Page');
  });
});
