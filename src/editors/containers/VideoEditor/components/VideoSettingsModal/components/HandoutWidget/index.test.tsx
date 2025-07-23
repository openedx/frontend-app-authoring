import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { HandoutWidgetInternal as HandoutWidget } from '.';

jest.mock('@src/editors/data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      getHandoutDownloadUrl: jest.fn(args => ({ getHandoutDownloadUrl: args })).mockName('selectors.video.getHandoutDownloadUrl'),
      handout: jest.fn(state => ({ handout: state })),
    },
    app: {
      isLibrary: jest.fn(args => ({ isLibrary: args })),
    },
    requests: {
      isFailed: jest.fn(args => ({ isFailed: args })),
    },
  },
}));

describe('HandoutWidget', () => {
  const props = {
    isLibrary: false,
    handout: '',
    isUploadError: false,
    getHandoutDownloadUrl: jest.fn().mockName('args.getHandoutDownloadUrl'),
    updateField: jest.fn().mockName('args.updateField'),
  };

  describe('renders', () => {
    beforeEach(() => {
      initializeMocks();
    });
    test('renders as expected with default props', () => {
      render(<HandoutWidget {...props} />);
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upload Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Handout' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
    });
    test('renders as expected with isLibrary true', () => {
      const { container } = render(<HandoutWidget {...props} isLibrary />);
      const reduxWrapper = container.firstChild;
      expect(reduxWrapper?.textContent).toBe('');
      expect(screen.queryByText('Handout')).not.toBeInTheDocument();
    });
    test('renders as expected with handout', () => {
      const handoutUrl = 'sOMeUrl ';
      render(<HandoutWidget {...props} handout={handoutUrl} />);
      expect(screen.getByText('Handout')).toBeInTheDocument();
      expect(screen.getByText(handoutUrl.trim())).toBeInTheDocument();
    });
  });
});
