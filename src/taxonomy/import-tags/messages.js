// ts-check
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  promptTaxonomyName: {
    id: 'course-authoring.import-tags.prompt.taxonomy-name',
    defaultMessage: 'Enter a name for the new taxonomy',
  },
  promptTaxonomyNameRequired: {
    id: 'course-authoring.import-tags.prompt.taxonomy-name.required',
    defaultMessage: 'You must enter a name for the new taxonomy',
  },
  promptTaxonomyDescription: {
    id: 'course-authoring.import-tags.prompt.taxonomy-description',
    defaultMessage: 'Enter a description for the new taxonomy',
  },
  importTaxonomySuccess: {
    id: 'course-authoring.import-tags.success',
    defaultMessage: 'Taxonomy imported successfully',
  },
  importTaxonomyError: {
    id: 'course-authoring.import-tags.error',
    defaultMessage: 'Import failed - see details in the browser console',
  },
  confirmImportTags: {
    id: 'course-authoring.import-tags.warning',
    defaultMessage: 'Warning! You are about to overwrite all tags in this taxonomy. Any tags applied to course'
      + ' content will be updated or removed. This cannot be undone.'
      + '\n\nAre you sure you want to continue importing this file?',
  },
});

export default messages;
