import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({

  title: {
    id: 'authoring.videoeditor.license.title',
    defaultMessage: 'License',
    description: 'Title for license widget',
  },
  licenseTypeLabel: {
    id: 'authoring.videoeditor.license.licenseType.label',
    defaultMessage: 'License Type',
    description: 'Label for license type selection field',
  },
  detailsSubsectionTitle: {
    id: 'authoring.videoeditor.license.detailsSubsection.title',
    defaultMessage: 'License Details',
    description: 'Title for license detatils subsection',
  },
  displaySubsectionTitle: {
    id: 'authoring.videoeditor.license.displaySubsection.title',
    defaultMessage: 'License Display',
    description: 'Title for license display subsection',
  },
  addLicenseButtonLabel: {
    id: 'authoring.videoeditor.license.add.label',
    defaultMessage: 'Add a license for this video',
    description: 'Label for add license button',
  },
  deleteLicenseSelection: {
    id: 'authoring.videoeditor.license.deleteLicenseSelection',
    defaultMessage: 'Clear and apply the course-level license',
    description: 'Message presented to user for action to delete license selection',
  },
  allRightsReservedIconsLabel: {
    id: 'authoring.videoeditor.license.allRightsReservedIcons.label',
    defaultMessage: 'All Rights Reserved',
    description: 'Label for row of all rights reserved icons',
  },
  creativeCommonsIconsLabel: {
    id: 'authoring.videoeditor.license.creativeCommonsIcons.label',
    defaultMessage: 'Some Rights Reserved',
    description: 'Label for row of creative common icons',
  },
  viewLicenseDetailsLabel: {
    id: 'authoring.videoeditor.license.viewLicenseDetailsLabel.label',
    defaultMessage: 'View license details',
    description: 'Label for view license details button',
  },
  courseLevelDescription: {
    id: 'authoring.videoeditor.license.courseLevelDescription.helperText',
    defaultMessage: 'This license currently set at the course level',
    description: 'Helper text for license type when using course license',
  },
  courseLicenseDescription: {
    id: 'authoring.videoeditor.license.courseLicenseDescription.message',
    defaultMessage: 'Licenses set at the course level appear at the bottom of courseware pages within your course.',
    description: 'Message explaining where course level licenses are set',
  },
  libraryLevelDescription: {
    id: 'authoring.videoeditor.license.libraryLevelDescription.helperText',
    defaultMessage: 'This license currently set at the library level',
    description: 'Helper text for license type when using library license',
  },
  libraryLicenseDescription: {
    id: 'authoring.videoeditor.license.libraryLicenseDescription.message',
    defaultMessage: 'Licenses set at the library level appear at the specific library video.',
    description: 'Message explaining where library level licenses are set',
  },
  defaultLevelDescription: {
    id: 'authoring.videoeditor.license.defaultLevelDescription.helperText',
    defaultMessage: 'This license is set specifically for this video',
    description: 'Helper text for license type when choosing for a spcific video',
  },
  defaultLicenseDescription: {
    id: 'authoring.videoeditor.license.defaultLicenseDescription.message',
    defaultMessage: 'When a video has a different license than the course as a whole, learners see the license at the bottom right of the video player.',
    description: 'Message explaining where video specific licenses are seen by users',
  },
  attributionCheckboxLabel: {
    id: 'authoring.videoeditor.license.attributionCheckboxLabel',
    defaultMessage: 'Attribution',
    description: 'Label for attribution checkbox',
  },
  attributionSectionDescription: {
    id: 'authoring.videoeditor.license.attributionSectionDescription',
    defaultMessage: 'Allow others to copy, distribute, display and perform your copyrighted work but only if they give credit the way you request. Currently, this option is required.',
    description: 'Attribution card section defining attribution license',
  },
  noncommercialCheckboxLabel: {
    id: 'authoring.videoeditor.license.noncommercialCheckboxLabel',
    defaultMessage: 'Noncommercial',
    description: 'Label for noncommercial checkbox',
  },
  noncommercialSectionDescription: {
    id: 'authoring.videoeditor.license.noncommercialSectionDescription',
    defaultMessage: 'Allow others to copy, distribute, display and perform your work - and derivative works based upon it - but for noncommercial purposes only.',
    description: 'Noncommercial card section defining noncommercial license',
  },
  noDerivativesCheckboxLabel: {
    id: 'authoring.videoeditor.license.noDerivativesCheckboxLabel',
    defaultMessage: 'No Derivatives',
    description: 'Label for No Derivatives checkbox',
  },
  noDerivativesSectionDescription: {
    id: 'authoring.videoeditor.license.noDerivativesSectionDescription',
    defaultMessage: 'Allow others to copy, distribute, display and perform only verbatim copies of your work, not derivative works based upon it. This option is incompatible with "Share Alike".',
    description: 'No Derivatives card section defining no derivatives license',
  },
  shareAlikeCheckboxLabel: {
    id: 'authoring.videoeditor.license.shareAlikeCheckboxLabel',
    defaultMessage: 'Share Alike',
    description: 'Label for Share Alike checkbox',
  },
  shareAlikeSectionDescription: {
    id: 'authoring.videoeditor.license.shareAlikeSectionDescription',
    defaultMessage: 'Allow others to distribute derivative works only under a license identical to the license that governs your work. This option is incompatible with "No Derivatives".',
    description: 'Share Alike card section defining no derivatives license',
  },
  allRightsReservedSectionMessage: {
    id: 'authoring.videoeditor.license.allRightsReservedSectionMessage',
    defaultMessage: 'You reserve all rights for your work.',
    description: 'All Rights Reserved section message',
  },
});

export default messages;
