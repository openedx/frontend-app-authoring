import React from 'react';
import {
  render, screen, initializeMocks,
  fireEvent,
} from '@src/testUtils';

import { formatMessage } from '../../../../../../testUtils';
import { SocialShareWidgetInternal as SocialShareWidget } from '.';
import * as hooks from './hooks';

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn().mockName('actions.video.updateField'),
    },
  },
  selectors: {
    app: {
      isLibrary: jest.fn(state => ({ isLibrary: state })),
    },
    video: {
      allowVideoSharing: jest.fn(state => ({ allowVideoSharing: state })),
      videoSharingEnabledForAll: jest.fn(state => ({ videoSharingEnabledForAll: state })),
      videoSharingEnabledForCourse: jest.fn(state => ({ videoSharingEnabledForCourse: state })),
      videoSharingLearnMoreLink: jest.fn(state => ({ videoSharingLearnMoreLink: state })),
    },
  },
}));

describe('SocialShareWidget', () => {
  const props = {
    intl: { formatMessage },
    videoSharingEnabledForCourse: false,
    videoSharingEnabledForAll: false,
    isLibrary: false,
    allowVideoSharing: {
      level: 'block',
      value: false,
    },
    videoSharingLearnMoreLink: 'sOMeURl.cOM',
    updateField: jest.fn().mockName('args.updateField'),
  };

  beforeEach(() => {
    initializeMocks();
    jest.spyOn(hooks, 'useTrackSocialSharingChange').mockReturnValue(jest.fn());
  });

  describe('rendered with videoSharingEnabled false', () => {
    describe('with default props', () => {
      it('should return null', () => {
        const { container } = render(<SocialShareWidget {...props} />);
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });

    describe('with videoSharingEnabledForAll false and isLibrary true', () => {
      it('should return null', () => {
        const { container } = render(<SocialShareWidget {...props} isLibrary />);
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });

    describe('with videoSharingEnabledForCourse and isLibrary false and videoSharingEnabledForAll true', () => {
      it('should return null', () => {
        const { container } = render(<SocialShareWidget {...props} videoSharingEnabledForAll />);
        const reduxWrapper = container.firstChild;
        expect(reduxWrapper?.textContent).toBe('');
      });
    });
  });

  describe('rendered with videoSharingEnabled true', () => {
    describe('and allowVideoSharing value equals true', () => {
      describe(' with level equal to course', () => {
        it('should have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'course',
              value: true,
            }}
          />);
          expect(screen.getByText('Change this setting on the course outline page.')).toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal true', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'course',
              value: true,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeDisabled();
        });
      });
      describe(' with level equal to block', () => {
        it('should not have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).not.toBeDisabled();
        });
      });
      describe('isLibrary equals true', () => {
        it('should not have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: true,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).not.toBeDisabled();
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        render(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: true,
          }}
        />);
        expect(screen.getByText('Social Sharing')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Social Sharing'));
        const subtitle = screen.getByText('Enabled');
        expect(subtitle).toBeInTheDocument();
      });
    });

    describe('and allowVideoSharing value equals false', () => {
      describe(' with level equal to course', () => {
        it('should have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'course',
              value: false,
            }}
          />);
          expect(screen.getByText('Change this setting on the course outline page.')).toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal true', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'course',
              value: false,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeDisabled();
        });
      });

      describe(' with level equal to block', () => {
        it('should not have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForCourse
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeEnabled();
        });
      });

      describe('isLibrary equals true', () => {
        it('should not have setting location message', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          expect(screen.queryByText('Change this setting on the course outline page.')).not.toBeInTheDocument();
        });
        it('should not have override note', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          expect(screen.queryByText('Note: This setting is overridden by the course outline page.')).not.toBeInTheDocument();
        });
        it('should have checkbox disabled prop equal false', () => {
          render(<SocialShareWidget
            {...props}
            videoSharingEnabledForAll
            isLibrary
            allowVideoSharing={{
              level: 'block',
              value: false,
            }}
          />);
          const checkbox = screen.getByRole('checkbox', { name: 'This video is shareable to social media' });
          expect(checkbox).toBeInTheDocument();
          expect(checkbox).toBeEnabled();
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        render(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: false,
          }}
        />);
        expect(screen.getByText('Social Sharing')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Social Sharing'));
        const subtitle = screen.getByText('Disabled');
        expect(subtitle).toBeInTheDocument();
      });
    });
  });
});
