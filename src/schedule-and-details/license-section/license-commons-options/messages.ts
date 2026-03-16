import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  licenseCreativeOptionsLabel: {
    id: 'course-authoring.schedule-section.license.creative-commons.options.label',
    defaultMessage: 'Options for creative commons',
  },
  licenseCreativeOptionsHelpText: {
    id: 'course-authoring.schedule-section.license.creative-commons.options.help-text',
    defaultMessage: 'The following options are available for the creative commons license.',
  },
  licenseCreativeOptionBYLabel: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.BY.label',
    defaultMessage: 'Attribution',
  },
  licenseCreativeOptionBYDescription: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.BY.description',
    defaultMessage: 'Allow others to copy, distribute, display and perform your copyrighted work but only if they give credit the way you request. Currently, this option is required.',
  },
  licenseCreativeOptionNCLabel: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.NC.label',
    defaultMessage: 'Noncommercial',
  },
  licenseCreativeOptionNCDescription: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.NC.description',
    defaultMessage: ' Allow others to copy, distribute, display and perform your work - and derivative works based upon it - but for noncommercial purposes only.',
  },
  licenseCreativeOptionNDLabel: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.ND.label',
    defaultMessage: 'No derivatives',
  },
  licenseCreativeOptionNDDescription: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.ND.description',
    defaultMessage: 'Allow others to copy, distribute, display and perform only verbatim copies of your work, not derivative works based upon it. This option is incompatible with "Share Alike".',
  },
  licenseCreativeOptionSALabel: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.SA.label',
    defaultMessage: 'Share alike',
  },
  licenseCreativeOptionSADescription: {
    id: 'course-authoring.schedule-section.license.creative-commons.option.SA.description',
    defaultMessage: 'Allow others to distribute derivative works only under a license identical to the license that governs your work. This option is incompatible with "No Derivatives".',
  },
});

export default messages;
