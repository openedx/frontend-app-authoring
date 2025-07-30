import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { render, screen, initializeMocks } from '../../../../../../testUtils';
import { getProblemTitles } from '@src/editors/data/constants/problem';
import Preview from './Preview';

// Mock ProblemTypes and getProblemTypes functions
jest.mock('@src/editors/data/constants/problem', () => {
  const actualModule = jest.requireActual('@src/editors/data/constants/problem');

  return {
    ...actualModule,
    ProblemTypes: {
      example: {
        title: 'Example Title',
        preview: 'example.png',
        previewDescription: 'Example description',
        helpLink: 'https://help.example.com',
      },
    },
    getProblemTypes: jest.fn(() => ({
      example: {
        title: 'Example Title',
        previewDescription: 'Example description',
      },
    })),
}));

// Mock useIntl
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: jest.fn(),
}));

const mockUseIntl = useIntl as jest.MockedFunction<typeof useIntl>;

describe('Preview', () => {
  const mockFormatMessage = jest.fn((message, values = {}) => {
    if (message.id === 'authoring.problemEditor.preview.title') {
      return `${values.previewTitle} problem`;
    }
    if (message.id === 'authoring.problemEditor.preview.altText') {
      return `A preview illustration of a ${values.problemType} problem`;
    }
    if (message.id === 'authoring.problemEditor.preview.description') {
      return values.previewDescription;
    }
    if (message.id === 'authoring.problemEditor.learnMoreButtonLabel.label') {
      return 'Learn more';
    }
    return message.defaultMessage;
  });

  beforeEach(() => {
    initializeMocks();
    mockUseIntl.mockReturnValue({
      formatMessage: mockFormatMessage,
    } as any);
    mockFormatMessage.mockClear();
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
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'A preview illustration of a example problem');
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
