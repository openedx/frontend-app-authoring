import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthZTitle, { AuthZTitleProps } from './AuthZTitle';

describe('AuthZTitle', () => {
  const defaultProps: AuthZTitleProps = {
    activeLabel: 'Current Page',
    pageTitle: 'Page Title',
    pageSubtitle: 'Page Subtitle',
  };

  it('renders without optional fields', () => {
    render(<AuthZTitle {...defaultProps} />);
    expect(screen.getByText(defaultProps.activeLabel)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.pageTitle)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.pageSubtitle as string)).toBeInTheDocument();
  });

  it('renders breadcrumb with links and active label', () => {
    const navLinks = [
      { label: 'Root', to: '/' },
      { label: 'Section', to: '/section' },
    ];

    render(<AuthZTitle {...defaultProps} navLinks={navLinks} />);

    navLinks.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByText(defaultProps.activeLabel)).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<AuthZTitle {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(defaultProps.pageTitle);
  });

  it('renders page subtitle as ReactNode', () => {
    const subtitleNode = <div data-testid="custom-subtitle">Custom Subtitle</div>;
    render(<AuthZTitle {...defaultProps} pageSubtitle={subtitleNode} />);
    expect(screen.getByTestId('custom-subtitle')).toBeInTheDocument();
  });

  it('renders action buttons and triggers onClick', () => {
    const onClick1 = jest.fn();
    const onClick2 = jest.fn();
    const actions = [
      { label: 'Save', onClick: onClick1 },
      { label: 'Cancel', onClick: onClick2 },
    ];

    render(<AuthZTitle {...defaultProps} actions={actions} />);

    actions.forEach(({ label, onClick }) => {
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });
  });
});
