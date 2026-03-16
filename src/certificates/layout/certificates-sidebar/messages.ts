import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  workingWithCertificatesTitle: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.title',
    defaultMessage: 'Working with certificates',
    description: 'Title for the section on how to work with certificates',
  },
  workingWithCertificatesFirstParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.first-paragraph',
    defaultMessage: 'Specify a course title to use on the certificate if the course\'s official title is too long to be displayed well.',
    description: 'Instructions for specifying a course title for the certificate',
  },
  workingWithCertificatesSecondParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.second-paragraph',
    defaultMessage: 'For verified certificates, specify between one and four signatories and upload the associated images. To edit or delete a certificate before it is activated, hover over the top right corner of the form and select {strongText} or the delete icon.',
    description: 'Details on how to specify signatories for verified certificates and edit or delete certificates',
  },
  workingWithCertificatesSecondParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.second-paragraph.strong',
    defaultMessage: 'Edit',
    description: 'The strong emphasis text for the edit option',
  },
  workingWithCertificatesThirdParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.third-paragraph',
    defaultMessage: 'To view a sample certificate, choose a course mode and select {strongText}.',
    description: 'Instructions on how to view a sample certificate',
  },
  workingWithCertificatesThirdParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.third-paragraph.strong',
    defaultMessage: 'Preview certificate',
    description: 'The strong emphasis text for the button to preview a sample certificate',
  },
  issuingCertificatesTitle: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.title',
    defaultMessage: 'Issuing certificates to learners',
    description: 'Title for the section on issuing certificates to learners',
  },
  issuingCertificatesFirstParagraph: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.first-paragraph',
    defaultMessage: 'To begin issuing course certificates, a course team member with either the Staff or Admin role selects {strongText}. Only course team members with these roles can edit or delete an activated certificate.',
    description: 'Instructions for issuing course certificates and the roles required to edit or delete certificates',
  },
  issuingCertificatesFirstParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.first-paragraph.strong',
    defaultMessage: 'Activate',
    description: 'The strong emphasis text for the activation option',
  },
  issuingCertificatesSecondParagraph: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.second-paragraph',
    defaultMessage: '{strongText} delete certificates after a course has started; learners who have already earned certificates will no longer be able to access them.',
    description: 'A warning against deleting certificates once a course has started, noting the impact on learners',
  },
  issuingCertificatesSecondParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.second-paragraph.strong',
    defaultMessage: 'Do not',
    description: 'The strong emphasis text part of the warning against deleting certificates',
  },
  learnMoreBtn: {
    id: 'course-authoring.certificates.sidebar.learnmore.button',
    defaultMessage: 'Learn more about certificates',
    description: 'Text for a button that links to additional information about setting up certificates in studio',
  },
});

export default messages;
