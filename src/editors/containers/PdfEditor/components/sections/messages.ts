import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  downloadOptions: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions',
    defaultMessage: 'Download Options',
    description: 'Section header for configuring what options a learner has for downloading a PDF'
      + ' or its source material.',
  },
  allowDownloadLabel: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.allowDownload.label',
    defaultMessage: 'Show PDF download link',
    description: 'Label for the "Allow Download" setting, which toggles the Download link for a PDF.',
  },
  allowDownloadHint: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.allowDownload.hint',
    defaultMessage: 'Display a download link to this PDF for convenience. Please note that even if this is disabled, '
      + 'the embedded PDF viewer may still display its own download button.',
    description: 'Hint for the "Allow Download" setting, which toggles the Download link for a PDF.',
  },
  sourceDocumentButtonTextLabel: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceDocumentButtonText.label',
    defaultMessage: 'Source document button text',
    description: 'Label for the source document button text setting, which allows the instructor to customize '
      + 'the text on the source download button for PDFs.',
  },
  sourceDocumentButtonTextPlaceholder: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceDocumentButtonText.placeholder',
    defaultMessage: 'Default: Download the source document',
    description: 'Placeholder text for the source document button text setting, which allows the instructor to '
      + 'customize the text on the source download button for PDFs.',
  },
  sourceUrlLabel: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceUrl.label',
    defaultMessage: 'Source document URL',
    description: 'Label for the field used to specify the URL of a source document a PDF was generated from.',
  },
  sourceUrlHint: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceUrl.hint',
    defaultMessage: 'Add a download link for the source file of your PDF. Use it, for example, to provide a '
      + 'PowerPoint file used to create this PDF.',
    description: 'Hint for the field used to specify the URL of a source document a PDF was generated from.',
  },
});

export default messages;
