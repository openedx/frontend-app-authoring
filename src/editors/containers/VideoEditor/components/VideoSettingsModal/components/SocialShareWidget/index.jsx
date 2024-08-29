import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Hyperlink,
  Form,
} from '@openedx/paragon';

import { selectors, actions } from '../../../../../../data/redux';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import messages from './messages';
import * as hooks from './hooks';

/**
 * Collapsible Form widget controlling video thumbnail
 */
const SocialShareWidget = ({
  // injected
  intl,
  // redux
  allowVideoSharing,
  isLibrary,
  videoSharingEnabledForAll,
  videoSharingEnabledForCourse,
  videoSharingLearnMoreLink,
  updateField,
}) => {
  const isSetByCourse = allowVideoSharing.level === 'course';
  const videoSharingEnabled = isLibrary ? videoSharingEnabledForAll : videoSharingEnabledForCourse;
  const learnMoreLink = videoSharingLearnMoreLink || 'http://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/developing_course/social_sharing.html';
  const onSocialSharingCheckboxChange = hooks.useTrackSocialSharingChange({ updateField });

  const getSubtitle = () => {
    if (allowVideoSharing.value) {
      return intl.formatMessage(messages.enabledSubtitle);
    }
    return intl.formatMessage(messages.disabledSubtitle);
  };

  return (videoSharingEnabled ? (
    <CollapsibleFormWidget
      fontSize="x-small"
      title={intl.formatMessage(messages.title)}
      subtitle={getSubtitle()}
    >
      <div>
        <FormattedMessage {...messages.socialSharingDescription} />
      </div>
      <Form.Checkbox
        className="mt-3"
        checked={allowVideoSharing.value}
        disabled={isSetByCourse}
        onChange={onSocialSharingCheckboxChange}
      >
        <div className="small text-gray-700">
          {intl.formatMessage(messages.socialSharingCheckboxLabel)}
        </div>
      </Form.Checkbox>
      {isSetByCourse && (
        <>
          <div className="mt-2">
            <FormattedMessage {...messages.overrideSocialSharingNote} />
          </div>
          <div>
            <FormattedMessage {...messages.disclaimerSettingLocation} />
          </div>
        </>
      )}
      <div className="mt-3">
        <Hyperlink className="text-primary-500" destination={learnMoreLink} target="_blank">
          {intl.formatMessage(messages.learnMoreLinkLabel)}
        </Hyperlink>
      </div>
    </CollapsibleFormWidget>
  ) : null);
};

SocialShareWidget.defaultProps = {
  allowVideoSharing: {
    level: 'block',
    value: false,
  },
  videoSharingEnabledForCourse: false,
  videoSharingEnabledForAll: false,
};

SocialShareWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
  // redux
  allowVideoSharing: PropTypes.shape({
    level: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
  }),
  isLibrary: PropTypes.bool.isRequired,
  videoSharingEnabledForAll: PropTypes.bool,
  videoSharingEnabledForCourse: PropTypes.bool,
  videoSharingLearnMoreLink: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  allowVideoSharing: selectors.video.allowVideoSharing(state),
  isLibrary: selectors.app.isLibrary(state),
  videoSharingLearnMoreLink: selectors.video.videoSharingLearnMoreLink(state),
  videoSharingEnabledForAll: selectors.video.videoSharingEnabledForAll(state),
  videoSharingEnabledForCourse: selectors.video.videoSharingEnabledForCourse(state),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export const SocialShareWidgetInternal = SocialShareWidget; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SocialShareWidget));
