import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink, Form } from '@openedx/paragon';

import { selectors, actions } from '../../../../../../data/redux';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import messages from './messages';
import * as hooks from './hooks';

/**
 * Collapsible Form widget controlling video thumbnail
 */
const SocialShareWidget = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const allowVideoSharing = useSelector(selectors.video.allowVideoSharing);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const videoSharingLearnMoreLink = useSelector(selectors.video.videoSharingLearnMoreLink);
  const videoSharingEnabledForAll = useSelector(selectors.video.videoSharingEnabledForAll);
  const videoSharingEnabledForCourse = useSelector(selectors.video.videoSharingEnabledForCourse);

  const isSetByCourse = allowVideoSharing.level === 'course';
  const videoSharingEnabled = isLibrary ? videoSharingEnabledForAll : videoSharingEnabledForCourse;
  const learnMoreLink = videoSharingLearnMoreLink || 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/social_sharing.html';

  const onSocialSharingCheckboxChange = hooks.useTrackSocialSharingChange({
    updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
  });

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
