import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { formatMessage } from '../../../../../../testUtils';
import { actions, selectors } from '../../../../../../data/redux';
import { SocialShareWidgetInternal as SocialShareWidget, mapStateToProps, mapDispatchToProps } from '.';
import messages from './messages';

jest.mock('react', () => {
  const updateState = jest.fn();
  return {
    ...jest.requireActual('react'),
    updateState,
    useContext: jest.fn(() => ({ license: ['error.license', jest.fn().mockName('error.setLicense')] })),
  };
});

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
    title: 'tiTLE',
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

  describe('rendered with videoSharingEnabled false', () => {
    describe('with default props', () => {
      it('should return null', () => {
        const wrapper = shallow(<SocialShareWidget {...props} />);
        expect(wrapper.snapshot).toMatchSnapshot();
      });
    });
    describe('with videoSharingEnabledForAll false and isLibrary true', () => {
      it('should return null', () => {
        const wrapper = shallow(<SocialShareWidget {...props} isLibrary />);
        expect(wrapper.snapshot).toMatchSnapshot();
      });
    });
    describe('with videoSharingEnabledForCourse and isLibrary false and videoSharingEnabledForAll true', () => {
      it('should return null', () => {
        const wrapper = shallow(<SocialShareWidget {...props} videoSharingEnabledForAll />);
        expect(wrapper.snapshot).toMatchSnapshot();
      });
    });
  });

  describe('rendered with videoSharingEnabled true', () => {
    describe('and allowVideoSharing value equals true', () => {
      describe(' with level equal to course', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'course',
            value: true,
          }}
        />);
        it('should have setting location message', () => {
          const settingLocationDisclaimer = wrapper.instance.findByType('FormattedMessage')[2].props.defaultMessage;
          expect(settingLocationDisclaimer).toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should have checkbox disabled prop equal true', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(true);
        });
      });
      describe(' with level equal to block', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: true,
          }}
        />);
        it('should not have setting location message', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages[0]).not.toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should not have override note', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages[0]).not.toEqual(messages.overrideSocialSharingNote.defaultMessage);
        });
        it('should have checkbox disabled prop equal false', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(false);
        });
      });
      describe('isLibrary equals true', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForAll
          isLibrary
          allowVideoSharing={{
            level: 'block',
            value: true,
          }}
        />);
        it('should not have setting location message', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages[0]).not.toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should not have override note', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages[0]).not.toEqual(messages.overrideSocialSharingNote.defaultMessage);
        });
        it('should have checkbox disabled prop equal false', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(false);
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: true,
          }}
        />);
        const { subtitle } = wrapper.shallowWrapper.props;
        expect(wrapper.snapshot).toMatchSnapshot();
        expect(subtitle).toEqual('Enabled');
      });
    });
    describe('and allowVideoSharing value equals false', () => {
      describe(' with level equal to course', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'course',
            value: false,
          }}
        />);
        it('should have setting location message', () => {
          const settingLocationDisclaimer = wrapper.instance.findByType('FormattedMessage')[2].props.defaultMessage;
          expect(settingLocationDisclaimer).toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should have checkbox disabled prop equal true', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(true);
        });
      });
      describe(' with level equal to block', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: false,
          }}
        />);
        it('should not have setting location message', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages.at(0)).not.toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should not have override note', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages.at(0)).not.toEqual(messages.overrideSocialSharingNote.defaultMessage);
        });
        it('should have checkbox disabled prop equal false', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(false);
        });
      });
      describe('isLibrary equals true', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForAll
          isLibrary
          allowVideoSharing={{
            level: 'block',
            value: false,
          }}
        />);
        it('should not have setting location message', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages.at(0)).not.toEqual(messages.disclaimerSettingLocation.defaultMessage);
        });
        it('should not have override note', () => {
          const formattedMessages = wrapper.instance.findByType('FormattedMessage');
          expect(formattedMessages.length).toEqual(1);
          expect(formattedMessages.at(0)).not.toEqual(messages.overrideSocialSharingNote.defaultMessage);
        });
        it('should have checkbox disabled prop equal false', () => {
          const disabledCheckbox = wrapper.shallowWrapper.props.children[1].props.disabled;
          expect(disabledCheckbox).toEqual(false);
        });
      });
      it('should have subtitle with text that reads Enabled', () => {
        const wrapper = shallow(<SocialShareWidget
          {...props}
          videoSharingEnabledForCourse
          allowVideoSharing={{
            level: 'block',
            value: false,
          }}
        />);
        const { subtitle } = wrapper.shallowWrapper.props;
        expect(wrapper.snapshot).toMatchSnapshot();
        expect(subtitle).toEqual('Disabled');
      });
    });
  });
  describe('mapStateToProps', () => {
    const testState = { A: 'pple', B: 'anana', C: 'ucumber' };
    test('isLibrary from app.isLibrary', () => {
      expect(
        mapStateToProps(testState).isLibrary,
      ).toEqual(selectors.app.isLibrary(testState));
    });
    test('allowVideoSharing from video.allowVideoSharing', () => {
      expect(
        mapStateToProps(testState).allowVideoSharing,
      ).toEqual(selectors.video.allowVideoSharing(testState));
    });
    test('videoSharingEnabledForCourse from video.videoSharingEnabledForCourse', () => {
      expect(
        mapStateToProps(testState).videoSharingEnabledForCourse,
      ).toEqual(selectors.video.videoSharingEnabledForCourse(testState));
    });
    test('videoSharingEnabledForAll from video.videoSharingEnabledForAll', () => {
      expect(
        mapStateToProps(testState).videoSharingEnabledForAll,
      ).toEqual(selectors.video.videoSharingEnabledForAll(testState));
    });
    test('videoSharingLearnMoreLink from video.videoSharingLearnMoreLink', () => {
      expect(
        mapStateToProps(testState).videoSharingLearnMoreLink,
      ).toEqual(selectors.video.videoSharingLearnMoreLink(testState));
    });
  });
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    test('updateField from actions.video.updateField', () => {
      expect(mapDispatchToProps.updateField).toEqual(dispatch(actions.video.updateField));
    });
  });
});
