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
} from '@edx/paragon';

import { selectors, actions } from '../../../../../../data/redux';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import messages from './messages';

/**
 * Collapsible Form widget controlling video thumbnail
 */
export const SocialShareWidget = ({
  // injected
  intl,
  // redux
  allowVideoSharing,
  videoSharingEnabledForCourse,
  videoSharingLearnMoreLink,
  updateField,
}) => {
  const isSetByCourse = allowVideoSharing.level === 'course';
  const getSubtitle = () => {
    if (allowVideoSharing.value) {
      return intl.formatMessage(messages.enabledSubtitle);
    }
    return intl.formatMessage(messages.disabledSubtitle);
  };

  return (videoSharingEnabledForCourse ? (
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
        onChange={(e) => updateField({
          allowVideoSharing: {
            ...allowVideoSharing,
            value: e.target.checked,
          },
        })}
      >
        <div className="small text-gray-700">
          {intl.formatMessage(messages.socialSharingCheckboxLabel)}
        </div>
      </Form.Checkbox>
      <div>
        <FormattedMessage {...messages.overrideSocialSharingNote} />
      </div>
      {isSetByCourse && (
        <div>
          <FormattedMessage {...messages.disclaimerSettingLocation} />
        </div>
      )}
      <div className="mt-3">
        <Hyperlink className="text-primary-500" destination={videoSharingLearnMoreLink} target="_blank">
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
};

SocialShareWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
  // redux
  allowVideoSharing: PropTypes.shape({
    level: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
  }),
  videoSharingEnabledForCourse: PropTypes.bool,
  videoSharingLearnMoreLink: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  allowVideoSharing: selectors.video.allowVideoSharing(state),
  videoSharingLearnMoreLink: selectors.video.videoSharingLearnMoreLink(state),
  videoSharingEnabledForCourse: selectors.video.videoSharingEnabledForCourse(state),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SocialShareWidget));
