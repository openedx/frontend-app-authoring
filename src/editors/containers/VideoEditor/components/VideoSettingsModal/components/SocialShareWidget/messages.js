import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'authoring.videoeditor.socialShare.title',
    defaultMessage: 'Social Sharing',
    description: 'Title for socialShare widget',
  },
  disabledSubtitle: {
    id: 'authoring.videoeditor.socialShare.disabled.subtitle',
    defaultMessage: 'Disabled',
    description: 'Subtitle for unavailable socialShare widget',
  },
  enabledSubtitle: {
    id: 'authoring.videoeditor.socialShare.enabled.subtitle',
    defaultMessage: 'Enabled',
    description: 'Subtitle for when thumbnail has been uploaded to the widget',
  },
  learnMoreLinkLabel: {
    id: 'authoring.videoeditor.socialShare.learnMore.link',
    defaultMessage: 'Learn more about social sharing',
    description: 'Text for link to learn more about social sharing',
  },
  socialSharingDescription: {
    id: 'authoring.videoeditor.socialShare.description',
    defaultMessage: 'Allow this video to be shareable to social media',
    description: 'Description for sociail sharing setting',
  },
  socialSharingCheckboxLabel: {
    id: 'authoring.videoeditor.socialShare.checkbox.label',
    defaultMessage: 'This video is shareable to social media',
    description: 'Label for checkbox for allowing video to be share',
  },
  overrideSocialSharingNote: {
    id: 'authoring.videoeditor.socialShare.overrideNote',
    defaultMessage: 'Note: This setting is overridden by the course outline page.',
    description: 'Message that the setting can be overriden in the course outline',
  },
  disclaimerSettingLocation: {
    id: 'authoring.videoeditor.socialShare.settingsDisclaimer',
    defaultMessage: 'Change this setting on the course outline page.',
    description: 'Message for disabled checkbox that notifies user that setting can be modified in course outline',
  },
});

export default messages;
