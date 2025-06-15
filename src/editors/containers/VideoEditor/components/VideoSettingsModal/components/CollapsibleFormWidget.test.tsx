import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import CollapsibleFormWidget from './CollapsibleFormWidget';

describe('CollapsibleFormWidget', () => {
  const props = {
    isError: false,
    subtitle: 'Sample subtitle',
    title: 'Sample title',
    fontSize: 'x-small',
  };
  const testContent = (<p>Some test string</p>);

  beforeEach(() => {
    initializeMocks();
  });

  test('renders component', () => {
    render(<CollapsibleFormWidget {...props}>{testContent}</CollapsibleFormWidget>);
    expect(screen.getByText('Sample title')).toBeInTheDocument();
    expect(screen.getByText('Some test string')).toBeInTheDocument();
  });
});
