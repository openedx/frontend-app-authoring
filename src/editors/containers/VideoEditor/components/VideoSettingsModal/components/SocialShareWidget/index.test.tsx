import React from 'react';
import {
  screen, initializeMocks,
  fireEvent,
} from '@src/testUtils';

import SocialShareWidget from '.';
import * as hooks from './hooks';
import editorRender from '../../../../../../editorTestRender';
import { initializeStore } from '../../../../../../data/redux';

describe('SocialShareWidget', () => {
  const initialState = {
    video: {
      allowVideoSharing: { level: 'block', value: false },
      videoSharingEnabledForAll: false,
      videoSharingEnabledForCourse: false,
      videoSharingLearnMoreLink: 'sOMeURl.cOM',
    },
    app: {
      isLibrary: false,
    },
  };

  beforeEach(() => {
    initializeMocks({ initialState, initializeStore });
    jest.spyOn(hooks, 'useTrackSocialSharingChange').mockReturnValue(jest.fn());
  });

  describe('rendered with videoSharingEnabled false', () => {
    describe('with default props', () => {
      it('should return null', () => {
        const { container } = editorRender(<SocialShareWidget />, { initialState });
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });

    describe('with videoSharingEnabledForAll false and isLibrary true', () => {
      it('should return null when sharing is disabled', () => {
        const modifiedInitialState = {
          ...initialState,
          app: {
            isLibrary: true,
          },
          video: {
            ...initialState.video,
            videoSharingEnabledForAll: false,
            videoSharingEnabledForCourse: false,
          },
        };
        const { container } = editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });

    describe('with videoSharingEnabledForCourse and isLibrary false and videoSharingEnabledForAll true', () => {
      it('should return null', () => {
        const modifiedInitialState = {
          ...initialState,
          app: {
            isLibrary: true,
          },
          video: {
            ...initialState.video,
            videoSharingEnabledForAll: true,
            videoSharingEnabledForCourse: false,
          },
        };
        const { container } = editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });
  });

  describe('rendered with videoSharingEnabled true', () => {
    describe('and allowVideoSharing value equals true', () => {
      describe(' with level equal to course', () => {
        it('should have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'course', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.getByText('Change this setting on the course outline page.')).toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal true', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'course', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeDisabled();
        });
      });
      describe(' with level equal to block', () => {
        it('should not have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).not.toBeDisabled();
        });
      });
      describe('isLibrary equals true', () => {
        it('should not have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true,
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true,
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz',
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: true },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).not.toBeDisabled();
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        const modifiedInitialState = {
          ...initialState,

          video: {
            ...initialState.video,
            allowVideoSharing: { level: 'block', value: true },
            videoSharingEnabledForCourse: true,
          },
        };
        editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
        expect(screen.getByText('Social Sharing')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Social Sharing'));
        const subtitle = screen.getByText('Enabled');
        expect(subtitle).toBeInTheDocument();
      });
    });

    describe('and allowVideoSharing value equals false', () => {
      describe(' with level equal to course', () => {
        it('should have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'course', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.getByText('Change this setting on the course outline page.')).toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal true', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'course', value: true },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeDisabled();
        });
      });

      describe(' with level equal to block', () => {
        it('should not have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          const modifiedInitialState = {
            ...initialState,
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForCourse: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeEnabled();
        });
      });

      describe('isLibrary equals true', () => {
        it('should not have setting location message', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz',
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz',
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          const modifiedInitialState = {
            ...initialState,
            app: {
              isLibrary: true, learningContextId: 'lib-v1:abc123', blockId: 'lb:xyz',
            },
            video: {
              ...initialState.video,
              allowVideoSharing: { level: 'block', value: false },
              videoSharingEnabledForAll: true,
            },
          };
          editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeEnabled();
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        const modifiedInitialState = {
          ...initialState,
          video: {
            ...initialState.video,
            allowVideoSharing: { level: 'block', value: false },
            videoSharingEnabledForCourse: true,
          },
        };
        editorRender(<SocialShareWidget />, { initialState: modifiedInitialState });
        expect(screen.getByText('Social Sharing')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Social Sharing'));
        const subtitle = screen.getByText('Disabled');
        expect(subtitle).toBeInTheDocument();
      });
    });
  });
});
