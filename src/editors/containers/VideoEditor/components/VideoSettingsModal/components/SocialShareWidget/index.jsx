import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Form } from '@openedx/paragon';

import { selectors, actions } from '@src/editors/data/redux';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import messages from './messages';
import * as hooks from './hooks';

/**
 * Collapsible Form widget controlling video social sharing.
 */
const SocialShareWidget = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  // ✅ Get values from Redux using useSelector
  const allowVideoSharing = useSelector(selectors.video.allowVideoSharing);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const videoSharingLearnMoreLink = useSelector(selectors.video.videoSharingLearnMoreLink);
  const videoSharingEnabledForAll = useSelector(selectors.video.videoSharingEnabledForAll);
  const videoSharingEnabledForCourse = useSelector(selectors.video.videoSharingEnabledForCourse);

  // ✅ Equivalent logic for determining what’s active
  const isSetByCourse = allowVideoSharing.level === 'course';
  const videoSharingEnabled = isLibrary ? videoSharingEnabledForAll : videoSharingEnabledForCourse;
  const learnMoreLink = videoSharingLearnMoreLink
    || 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/social_sharing.html';

  const updateField = (payload) => dispatch(actions.video.updateField(payload));
  const onSocialSharingCheckboxChange = hooks.useTrackSocialSharingChange({ updateField });

  const getSubtitle = () => (allowVideoSharing.value
    ? intl.formatMessage(messages.enabledSubtitle)
    : intl.formatMessage(messages.disabledSubtitle));

  if (!videoSharingEnabled) { return null; }

  return (
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
        <Hyperlink
          className="text-primary-500"
          destination={learnMoreLink}
          target="_blank"
        >
          {intl.formatMessage(messages.learnMoreLinkLabel)}
        </Hyperlink>
      </div>
    </CollapsibleFormWidget>
  );
};

export default SocialShareWidget;
