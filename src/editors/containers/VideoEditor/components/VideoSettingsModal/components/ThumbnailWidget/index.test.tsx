import React from 'react';
import { screen, initializeMocks } from '@src/testUtils';
import { editorRender, type PartialEditorState } from '@src/editors/editorTestRender';
import ThumbnailWidget from '.';

jest.mock('../../../../../../data/services/cms/api', () => ({
  isEdxVideo: (args) => (args),
}));

describe('ThumbnailWidget', () => {
  const initialState: PartialEditorState = {
    app: {
      learningContextId: 'random-id',
    },
    video: {
      allowThumbnailUpload: false,
      thumbnail: '' as any,
      videoId: '',
    },
  };

  beforeEach(() => {
    initializeMocks({ });
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
          thumbnail: 'sOMeUrl' as any,
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
          thumbnail: 'sOMeUrl' as any,
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
          thumbnail: 'sOMeUrl' as any,
          videoId: 'sOMeViDEoID',
        },
      };
      editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      expect(screen.getByRole('img', { name: 'Image used as thumbnail for video' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
    });
    test('snapshots: renders as expected where videoId is valid and no thumbnail', () => {
      const modifiedInitialState = {
        ...initialState,
        video: {
          allowThumbnailUpload: true,
          thumbnail: '' as any,
          videoId: 'sOMeViDEoID',
        },
      };
      editorRender(<ThumbnailWidget />, { initialState: modifiedInitialState });
      expect(screen.getByRole('button', { name: 'Thumbnail' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Image used as thumbnail for video' })).not.toBeInTheDocument();
    });
  });
});
