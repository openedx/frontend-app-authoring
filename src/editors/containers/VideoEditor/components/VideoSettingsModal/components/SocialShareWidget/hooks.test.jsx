import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import analyticsEvents from './constants';
import * as hooks from './hooks';

jest.mock('../../../../../../data/redux', () => ({
  selectors: {
    app: {
      analytics: jest.fn((state) => ({ analytics: state })),
    },
    video: {
      allowVideoSharing: jest.fn((state) => ({ allowVideoSharing: state })),
    },
  },
}));

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('SocialShareWidget hooks', () => {
  describe('handleSocialSharingCheckboxChange when', () => {
    let onClick;
    let updateField;
    describe.each([true, false])('box is toggled', (checked) => {
      beforeAll(() => {
        jest.resetAllMocks();
        updateField = jest.fn();
        onClick = hooks.handleSocialSharingCheckboxChange({ updateField });
        expect(typeof onClick).toBe('function');
        onClick({ target: { checked } });
      });
      it('field is updated', () => {
        expect(updateField).toBeCalledWith({ allowVideoSharing: { value: checked } });
      });
      it('event tracking is called', () => {
        expect(sendTrackEvent).toBeCalledWith(
          analyticsEvents.socialSharingSettingChanged,
          { value: checked },
        );
      });
    });
  });
});
