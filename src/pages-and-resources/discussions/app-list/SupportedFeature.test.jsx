import React from 'react';
import { render, queryByText } from '@testing-library/react';

import SupportedFeature from './SupportedFeature';
import messages from './messages';

describe('SupportedFeature', () => {
  const name = messages['featureName-basic-configuration'].defaultMessage;
  let container;

  beforeEach(() => {
    const wrapper = render(
      <SupportedFeature
        name={name}
      />,
    );
    container = wrapper.container;
  });

  test('displays a check icon ', () => {
    expect(container.querySelector('svg')).toHaveAttribute('id', 'check-icon');
  });

  test('displays feature name', () => {
    expect(queryByText(container, name)).toBeInTheDocument();
  });
});
