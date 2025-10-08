import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  error: {
    id: 'course-authoring.container-comparison.diff.error.message',
    defaultMessage: 'Unexpected error: Failed to fetch container data',
    description: 'Generic error message',
  },
  removedDiffBeforeMessage: {
    id: 'course-authoring.container-comparison.diff.before.removed-message',
    defaultMessage: 'This {blockType} will be removed in the new version',
    description: 'Description for removed component in before section of diff preview',
  },
  removedDiffAfterMessage: {
    id: 'course-authoring.container-comparison.diff.after.removed-message',
    defaultMessage: 'This {blockType} was removed',
    description: 'Description for removed component in after section of diff preview',
  },
  modifiedDiffBeforeMessage: {
    id: 'course-authoring.container-comparison.diff.before.modified-message',
    defaultMessage: 'This {blockType} will be modified',
    description: 'Description for modified component in before section of diff preview',
  },
  modifiedDiffAfterMessage: {
    id: 'course-authoring.container-comparison.diff.after.modified-message',
    defaultMessage: 'This {blockType} was modified',
    description: 'Description for modified component in after section of diff preview',
  },
  addedDiffBeforeMessage: {
    id: 'course-authoring.container-comparison.diff.before.added-message',
    defaultMessage: 'This {blockType} will be added in the new version',
    description: 'Description for added component in before section of diff preview',
  },
  addedDiffAfterMessage: {
    id: 'course-authoring.container-comparison.diff.after.added-message',
    defaultMessage: 'This {blockType} was added',
    description: 'Description for added component in after section of diff preview',
  },
  renamedDiffBeforeMessage: {
    id: 'course-authoring.container-comparison.diff.before.renamed-message',
    defaultMessage: 'Original Library Name: {name}',
    description: 'Description for renamed component in before section of diff preview',
  },
  renamedDiffAfterMessage: {
    id: 'course-authoring.container-comparison.diff.after.renamed-message',
    defaultMessage: 'This {blockType} will remain renamed',
    description: 'Description for renamed component in after section of diff preview',
  },
  movedDiffBeforeMessage: {
    id: 'course-authoring.container-comparison.diff.before.moved-message',
    defaultMessage: 'This {blockType} will be moved in the new version',
    description: 'Description for moved component in before section of diff preview',
  },
  movedDiffAfterMessage: {
    id: 'course-authoring.container-comparison.diff.after.moved-message',
    defaultMessage: 'This {blockType} was moved',
    description: 'Description for moved component in after section of diff preview',
  },
  breadcrumbAriaLabel: {
    id: 'course-authoring.container-comparison.diff.breadcrumb.ariaLabel',
    defaultMessage: 'Title breadcrumb',
    description: 'Aria label text for breadcrumb in diff preview',
  },
  diffBeforeTitle: {
    id: 'course-authoring.container-comparison.diff.before.title',
    defaultMessage: 'Before',
    description: 'Before section title text',
  },
  diffAfterTitle: {
    id: 'course-authoring.container-comparison.diff.after.title',
    defaultMessage: 'After',
    description: 'After section title text',
  },
});

export default messages;
