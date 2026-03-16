import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  signatoryTitle: {
    id: 'course-authoring.certificates.signatories.title',
    defaultMessage: 'Signatory',
    description: 'Title for a signatory',
  },
  signatoriesRecommendation: {
    id: 'course-authoring.certificates.signatories.recommendation',
    defaultMessage: 'It is strongly recommended that you include four or fewer signatories. If you include additional signatories, preview the certificate in Print View to ensure the certificate will print correctly on one page.',
    description: 'A recommendation for the number of signatories to include on a certificate, emphasizing the importance of testing the print layout',
  },
  signatoriesSectionTitle: {
    id: 'course-authoring.certificates.signatories.section.title',
    defaultMessage: 'Certificate signatories',
    description: 'Title for the section',
  },
  addSignatoryButton: {
    id: 'course-authoring.certificates.signatories.add.signatory.button',
    defaultMessage: 'Add additional signatory',
    description: 'Button text for adding a new signatory to the certificate',
  },
  addSignatoryButtonDescription: {
    id: 'course-authoring.certificates.signatories.add.signatory.button.description',
    defaultMessage: '(Add signatories for a certificate)',
    description: 'Helper text for the button used to add signatories',
  },
  nameLabel: {
    id: 'course-authoring.certificates.signatories.name.label',
    defaultMessage: 'Name',
    description: 'Label for the input field where the signatory name is entered',
  },
  namePlaceholder: {
    id: 'course-authoring.certificates.signatories.name.placeholder',
    defaultMessage: 'Name of the signatory',
    description: 'Placeholder text for the signatory name input field',
  },
  nameDescription: {
    id: 'course-authoring.certificates.signatories.name.description',
    defaultMessage: 'The name of this signatory as it should appear on certificates.',
    description: 'Helper text under the name input field',
  },
  titleLabel: {
    id: 'course-authoring.certificates.signatories.title.label',
    defaultMessage: 'Title',
    description: 'Label for the input field where the signatory title is entered',
  },
  titlePlaceholder: {
    id: 'course-authoring.certificates.signatories.title.placeholder',
    defaultMessage: 'Title of the signatory',
    description: 'Placeholder text for the signatory title input field',
  },
  titleDescription: {
    id: 'course-authoring.certificates.signatories.title.description',
    defaultMessage: 'Titles more than 100 characters may prevent students from printing their certificate on a single page.',
    description: 'Helper text under the title input field',
  },
  organizationLabel: {
    id: 'course-authoring.certificates.signatories.organization.label',
    defaultMessage: 'Organization',
    description: 'Label for the input field where the signatory organization is entered',
  },
  organizationPlaceholder: {
    id: 'course-authoring.certificates.signatories.organization.placeholder',
    defaultMessage: 'Organization of the signatory',
    description: 'Placeholder text for the signatory organization input field',
  },
  organizationDescription: {
    id: 'course-authoring.certificates.signatories.organization.description',
    defaultMessage: 'The organization that this signatory belongs to, as it should appear on certificates.',
    description: 'Helper text under the organization input field',
  },
  imageLabel: {
    id: 'course-authoring.certificates.signatories.image.label',
    defaultMessage: 'Signature image',
    description: 'Label for the input field where the signatory image is selected',
  },
  imagePlaceholder: {
    id: 'course-authoring.certificates.signatories.image.placeholder',
    defaultMessage: 'Path to signature image',
    description: 'Placeholder text for the signatory image input field',
  },
  imageDescription: {
    id: 'course-authoring.certificates.signatories.image.description',
    defaultMessage: 'Image must be in PNG format',
    description: 'Helper text under the image input field',
  },
  uploadImageButton: {
    id: 'course-authoring.certificates.signatories.upload.image.button',
    defaultMessage: '{uploadText} signature image',
    description: 'Button text for adding or replacing a signature image',
  },
  uploadModal: {
    id: 'course-authoring.certificates.signatories.upload.modal',
    defaultMessage: 'Upload',
    description: 'Option for button text for adding a new signature image',
  },
  uploadModalReplace: {
    id: 'course-authoring.certificates.signatories.upload.modal.replace',
    defaultMessage: 'Replace',
    description: 'Option for button text for replacing an existing signature image',
  },
  deleteSignatoryConfirmation: {
    id: 'course-authoring.certificates.signatories.confirm-modal',
    defaultMessage: 'Delete "{name}" from the list of signatories?',
    description: 'Title for the confirmation modal when a user attempts to delete a signatory, where "{name}" is the name of the signatory to be deleted',
  },
  deleteSignatoryConfirmationMessage: {
    id: 'course-authoring.certificates.signatories.confirm-modal.message',
    defaultMessage: 'This action cannot be undone.',
    description: 'A warning message that emphasizes the permanence of the delete action for a signatory',
  },
});

export default messages;
