import React from 'react';
import {
  render, screen, initializeMocks,
} from '@src/testUtils';
import SettingsOption from './SettingsOption';

describe('SettingsOption', () => {
  const defaultProps = {
    title: 'Settings Option Title',
    summary: 'Settings Option Summary',
    hasExpandableTextArea: true,
    className: 'test-classname',
    extraSections: [],
  };

  beforeEach(() => {
    initializeMocks();
  });

  test('renders correct expanded area', () => {
    const children = <h1>My test content</h1>;
    render(<SettingsOption {...defaultProps}>{children}</SettingsOption>);
    expect(screen.getByText('Settings Option Title')).toBeInTheDocument();
    expect(screen.getByText('My test content')).toBeInTheDocument();
    expect(document.querySelector('.test-classname')).toBeInTheDocument();
  });

  test('renders summary when not expanded', () => {
    const children = <h1>My test content</h1>;
    render((<SettingsOption {...defaultProps} hasExpandableTextArea={false}>{children}</SettingsOption>));
    expect(screen.getByText('Settings Option Title')).toBeInTheDocument();
    expect(screen.queryByText('My test content')).not.toBeInTheDocument();
    expect(screen.getByText('Settings Option Summary')).toBeInTheDocument();
  });

  test('renders sections when expanded', () => {
    const children = (<h1>First Section</h1>);
    const sections = [{ children: <h1>Second Section</h1> }, { children: <h1>Third Section</h1> }];
    render(<SettingsOption {...defaultProps} extraSections={sections}>{children}</SettingsOption>);
    expect(screen.getByText('First Section')).toBeInTheDocument();
    expect(screen.getByText('Second Section')).toBeInTheDocument();
    expect(screen.getByText('Third Section')).toBeInTheDocument();
  });
});
