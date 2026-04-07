import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
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
    defaultMessage: 'Original File Link Text',
    description: 'Label for the source document button text setting, which allows the instructor to customize '
      + 'the text on the source download button for PDFs.',
  },
  sourceDocumentButtonTextPlaceholder: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceDocumentButtonText.placeholder',
    defaultMessage: 'Download the source document',
    description: 'Placeholder text for the source document button text setting, which allows the instructor to '
      + 'customize the text on the source download button for PDFs.',
  },
  sourceUrlLabel: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceUrl.label',
    defaultMessage: 'Original File URL',
    description: 'Label for the field used to specify the URL of a source document a PDF was generated from.',
  },
  sourceUrlHint: {
    id: 'authoring.pdfEditor.formGroups.downloadOptions.sourceUrl.hint',
    defaultMessage: 'Add a link to the original or editable file (e.g. Word or PowerPoint). Appears as a separate link.',
    description: 'Hint for the field used to specify the URL of a source document a PDF was generated from.',
  },
});

export default messages;
