import React from 'react';
import { render, screen, initializeMocks } from '../../../../../../testUtils';
import Preview from './Preview';

// Mock ProblemTypes and messages
jest.mock('../../../../../data/constants/problem', () => ({
  ProblemTypes: {
    example: {
      title: 'Example Title',
      preview: 'example.png',
      previewDescription: 'Example description',
      helpLink: 'https://help.example.com',
    },
  },
}));

describe('Preview', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders nothing if problemType is null', () => {
    const { container } = render(<Preview problemType={null} />);
    const reduxProviderDiv = container.querySelector('div[data-testid="redux-provider"]');
    expect(reduxProviderDiv?.innerHTML).toBe('');
  });

  it('renders preview with correct data for a valid problemType', () => {
    render(<Preview problemType="example" />);
    expect(screen.getByText('Example Title problem')).toBeInTheDocument();
    expect(screen.getByText('Example description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'example.png');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'A preview illustration of a null problem');
    expect(screen.getByRole('link', { name: 'Learn more in a new tab' })).toHaveAttribute('href', 'https://help.example.com');
  });

  it('renders the help link with target="_blank"', () => {
    render(<Preview problemType="example" />);
    const link = screen.getByRole('link', { name: 'Learn more in a new tab' });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders the correct title and description', () => {
    render(<Preview problemType="example" />);
    expect(screen.getByText('Example Title problem')).toBeInTheDocument();
    expect(screen.getByText('Example description')).toBeInTheDocument();
  });
});
