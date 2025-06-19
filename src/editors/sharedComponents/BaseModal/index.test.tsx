import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';

import BaseModal from '.';

const props = {
  isOpen: true,
  close: jest.fn().mockName('props.close'),
  title: 'title node',
  children: 'children node',
  confirmAction: 'confirmAction node',
  footerAction: 'footerAction node',
};

describe('BaseModal', () => {
  beforeEach(() => {
    initializeMocks();
  });

  test('renders component with all elements', () => {
    render(<BaseModal {...props} />);
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.children)).toBeInTheDocument();
    const confirmAction = screen.getByText((content) => content.includes(props.confirmAction));
    expect(confirmAction).toBeInTheDocument();
    const footerAction = screen.getByText((content) => content.includes(props.footerAction));
    expect(footerAction).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('does not render cancel buton when hideCancelButton is true', () => {
    render(<BaseModal {...props} hideCancelButton />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  test('does not render footerAction node when not provided', () => {
    render(<BaseModal {...props} footerAction={undefined} />);
    const footerAction = screen.queryByText((content) => content.includes(props.footerAction));
    expect(footerAction).not.toBeInTheDocument();
  });
});
