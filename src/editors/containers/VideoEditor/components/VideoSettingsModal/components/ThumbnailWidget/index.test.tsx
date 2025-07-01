import React from 'react';
import { render, screen, initializeMocks } from '@src/testUtils';
import { formatMessage } from '../../../../../../testUtils';
import { ThumbnailWidgetInternal as ThumbnailWidget } from '.';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    video: {
      allowThumbnailUpload: jest.fn(state => ({ allowThumbnailUpload: state })),
      thumbnail: jest.fn(state => ({ thumbnail: state })),
      videoId: jest.fn(state => ({ videoId: state })),
    },
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
  },
}));

jest.mock('../../../../../../data/services/cms/api', () => ({
  isEdxVideo: (args) => (args),
}));

describe('ThumbnailWidget', () => {
  const props = {
    error: {},
    title: 'tiTLE',
    intl: { formatMessage },
    isLibrary: false,
    allowThumbnailUpload: false,
    thumbnail: '',
    videoId: '',
    updateField: jest.fn().mockName('args.updateField'),
  };

  beforeEach(() => {
    initializeMocks();
  });

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      const { container } = render(<ThumbnailWidget {...props} />);
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected with isLibrary true', () => {
      const { container } = render(<ThumbnailWidget {...props} isLibrary />);
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected with a thumbnail provided', () => {
      render(<ThumbnailWidget {...props} thumbnail="sOMeUrl" videoId="sOMeViDEoID" />);
      expect(screen.getByRole('img', { name: 'Image used as thumbnail for video' })).toBeInTheDocument();
    });
    test('snapshots: renders as expected where thumbnail uploads are allowed', () => {
      const { container } = render(<ThumbnailWidget {...props} thumbnail="sOMeUrl" videoId="sOMeViDEoID" allowThumbnailUpload />);
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected where videoId is valid', () => {
      render(<ThumbnailWidget {...props} thumbnail="sOMeUrl" allowThumbnailUpload videoId="sOMeViDEoID" />);
      expect(screen.getByRole('img', { name: 'Image used as thumbnail for video' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
    });
    test('snapshots: renders as expected where videoId is valid and no thumbnail', () => {
      render(<ThumbnailWidget {...props} allowThumbnailUpload videoId="sOMeViDEoID" />);
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Image used as thumbnail for video' })).not.toBeInTheDocument();
    });
  });
});
