import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { formatMessage } from '../../../../../../testUtils';
import ThumbnailWidget from '.';
import editorRender from '../../../../../../editorTestRender';
import { initializeStore } from '../../../../../../data/redux';

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
  const initialState = {
    app: {
      isLibrary: false,
    },
    video: {
      allowThumbnailUpload: false,
      thumbnail: '',
      videoId: '',
    },
  };

  beforeEach(() => {
    initializeMocks({ initialState, initializeStore });
  });

  describe('snapshots', () => {
    test('snapshots: renders as expected with default props', () => {
      const { container } = editorRender(<ThumbnailWidget />, { initialState });
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected with isLibrary true', () => {
      const modifiedInitialState = {
        ...initialState,
        app: {
          ...initialState.app,
          isLibrary: true,
          learningContextId: 'lib-v1:abc123',
          blockId: 'lb:xyz',
        },
      };
      const { container } = editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected with a thumbnail provided', () => {
      const modifiedInitialState = {
        ...initialState,
        video: {
          allowThumbnailUpload: false,
          thumbnail: 'sOMeUrl',
          videoId: 'sOMeViDEoID',
        },
      };
      editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      expect(screen.getByRole('img', { name: 'Image used as thumbnail for video' })).toBeInTheDocument();
    });
    test('snapshots: renders as expected where thumbnail uploads are allowed', () => {
      const modifiedInitialState = {
        ...initialState,
        video: {
          allowThumbnailUpload: true,
          thumbnail: 'sOMeUrl',
          videoId: 'sOMeViDEoID',
        },
      };
      const { container } = editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      const reduxWrapper = container.getRootNode();
      expect(reduxWrapper.textContent).toBe(null);
    });
    test('snapshots: renders as expected where videoId is valid', () => {
      const modifiedInitialState = {
        ...initialState,
        video: {
          allowThumbnailUpload: true,
          thumbnail: 'sOMeUrl',
          videoId: 'sOMeViDEoID',
        },
      };
      editorRender(<ThumbnailWidget {...props} />, { initialState: modifiedInitialState });
      expect(screen.getByRole('img', { name: 'Image used as thumbnail for video' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
    });
    test('snapshots: renders as expected where videoId is valid and no thumbnail', () => {
      const modifiedInitialState = {
        ...initialState,
        video: {
          allowThumbnailUpload: true,
          thumbnail: '',
          videoId: 'sOMeViDEoID',
        },
      };
      editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Image used as thumbnail for video' })).not.toBeInTheDocument();
    });
  });
});
