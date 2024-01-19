import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  signatoryTitle: {
    id: 'course-authoring.certificates.signatories.title',
    defaultMessage: 'Signatory',
  },
  signatoriesRecommendation: {
    id: 'course-authoring.certificates.signatories.recommendation',
    defaultMessage: 'It is strongly recommended that you include four or fewer signatories. If you include additional signatories, preview the certificate in Print View to ensure the certificate will print correctly on one page.',
  },
  signatoriesSectionTitle: {
    id: 'course-authoring.certificates.signatories.section.title',
    defaultMessage: 'Certificate signatories',
  },
  addSignatoryButton: {
    id: 'course-authoring.certificates.signatories.add.signatory.button',
    defaultMessage: 'Add additional signatory',
  },
  addSignatoryButtonDescription: {
    id: 'course-authoring.certificates.signatories.add.signatory.button.description',
    defaultMessage: '(Add signatories for a certificate)',
  },
  nameLabel: {
    id: 'course-authoring.certificates.signatories.name.label',
    defaultMessage: 'Name',
  },
  namePlaceholder: {
    id: 'course-authoring.certificates.signatories.name.placeholder',
    defaultMessage: 'Name of the signatory',
  },
  nameDescription: {
    id: 'course-authoring.certificates.signatories.name.description',
    defaultMessage: 'The name of this signatory as it should appear on certificates.',
  },
  titleLabel: {
    id: 'course-authoring.certificates.signatories.title.label',
    defaultMessage: 'Title',
  },
  titlePlaceholder: {
    id: 'course-authoring.certificates.signatories.title.placeholder',
    defaultMessage: 'Title of the signatory',
  },
  titleDescription: {
    id: 'course-authoring.certificates.signatories.title.description',
    defaultMessage: 'Titles more than 100 characters may prevent students from printing their certificate on a single page.',
  },
  organizationLabel: {
    id: 'course-authoring.certificates.signatories.organization.label',
    defaultMessage: 'Organization',
  },
  organizationPlaceholder: {
    id: 'course-authoring.certificates.signatories.organization.placeholder',
    defaultMessage: 'Organization of the signatory',
  },
  organizationDescription: {
    id: 'course-authoring.certificates.signatories.organization.description',
    defaultMessage: 'The organization that this signatory belongs to, as it should appear on certificates.',
  },
  imageLabel: {
    id: 'course-authoring.certificates.signatories.image.label',
    defaultMessage: 'Signature image',
  },
  imagePlaceholder: {
    id: 'course-authoring.certificates.signatories.image.placeholder',
    defaultMessage: 'Path to signature image',
  },
  imageDescription: {
    id: 'course-authoring.certificates.signatories.image.description',
    defaultMessage: 'Image must be in PNG format',
  },
  uploadImageButton: {
    id: 'course-authoring.certificates.signatories.upload.image.button',
    defaultMessage: '{uploadText} signature image',
  },
  uploadModal: {
    id: 'course-authoring.certificates.signatories.upload.modal',
    defaultMessage: 'Upload',
  },
  uploadModalReplace: {
    id: 'course-authoring.certificates.signatories.upload.modal.replace',
    defaultMessage: 'Replace',
  },
  deleteSignatoryConfirmation: {
    id: 'course-authoring.certificates.signatories.confirm-modal',
    defaultMessage: 'Delete "{name}" from the list of signatories?',
  },
  deleteSignatoryConfirmationMessage: {
    id: 'course-authoring.certificates.signatories.confirm-modal.message',
    defaultMessage: 'This action cannot be undone.',
  },
});

export default messages;
