import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  workingWithCertificatesTitle: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.title',
    defaultMessage: 'Working with certificates',
  },
  workingWithCertificatesFirstParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.first-paragraph',
    defaultMessage: 'Specify a course title to use on the certificate if the course\'s official title is too long to be displayed well.',
  },
  workingWithCertificatesSecondParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.second-paragraph',
    defaultMessage: 'For verified certificates, specify between one and four signatories and upload the associated images. To edit or delete a certificate before it is activated, hover over the top right corner of the form and select {strongText} or the delete icon.',
  },
  workingWithCertificatesSecondParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.second-paragraph.strong',
    defaultMessage: 'Edit',
  },
  workingWithCertificatesThirdParagraph: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.third-paragraph',
    defaultMessage: 'To view a sample certificate, choose a course mode and select {strongText}.',
  },
  workingWithCertificatesThirdParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.working-with-certificates.third-paragraph.strong',
    defaultMessage: 'Preview certificate',
  },
  issuingCertificatesTitle: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.title',
    defaultMessage: 'Issuing certificates to learners',
  },
  issuingCertificatesFirstParagraph: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.first-paragraph',
    defaultMessage: 'To begin issuing course certificates, a course team member with either the Staff or Admin role selects {strongText}. Only course team members with these roles can edit or delete an activated certificate.',
  },
  issuingCertificatesFirstParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.first-paragraph.strong',
    defaultMessage: 'Activate',
  },
  issuingCertificatesSecondParagraph: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.second-paragraph',
    defaultMessage: '{strongText} delete certificates after a course has started; learners who have already earned certificates will no longer be able to access them.',
  },
  issuingCertificatesSecondParagraph_strong: {
    id: 'course-authoring.certificates.sidebar.issuing-certificates.second-paragraph.strong',
    defaultMessage: 'Do not',
  },
  learnMoreBtn: {
    id: 'course-authoring.certificates.sidebar.learnmore.button',
    defaultMessage: 'Learn more about certificates',
  },
});

export default messages;
