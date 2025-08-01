import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import Preview from './Preview';
import messages from './messages';

// Mock ProblemTypes to provide test data
jest.mock('@src/editors/data/constants/problem', () => {
  const actualModule = jest.requireActual('@src/editors/data/constants/problem');

  return {
    ...actualModule,
    ProblemTypes: {
      multiplechoiceresponse: {
        title: 'Single select',
        preview: 'singleselect.png',
        previewDescription: 'Learners must select the correct answer from a list of possible options.',
        helpLink: 'https://help.example.com/singleselect',
      },
    },
  };
});

// Helper to render component with proper IntlProvider
const renderWithIntl = (component: React.ReactElement) => {
  // Convert message objects to message strings for IntlProvider
  const messageStrings = Object.fromEntries(
    Object.entries(messages).map(([key, value]) => [key, (value as any).defaultMessage]),
  );

  return render(
    <IntlProvider locale="en" messages={messageStrings}>
      {component}
    </IntlProvider>,
  );
};

describe('Preview', () => {
  it('renders nothing if problemType is null', () => {
    const { container } = renderWithIntl(<Preview problemType={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders preview with correct data for a valid problemType', () => {
    renderWithIntl(<Preview problemType="multiplechoiceresponse" />);

    // Check that the title is rendered correctly
    expect(screen.getByText('Single select problem')).toBeInTheDocument();

    // Check that the description is rendered correctly
    expect(screen.getByText('Learners must select the correct answer from a list of possible options.')).toBeInTheDocument();

    // Check that the image has correct src attribute
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'singleselect.png');

    // Check that the learn more link is rendered correctly
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://help.example.com/singleselect');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('renders the help link with target="_blank"', () => {
    renderWithIntl(<Preview problemType="multiplechoiceresponse" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('href', 'https://help.example.com/singleselect');
  });

  it('displays the correct image source and alt text', () => {
    renderWithIntl(<Preview problemType="multiplechoiceresponse" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'singleselect.png');
    expect(image).toHaveAttribute('alt', 'A preview illustration of a single select problem');
  });
});
