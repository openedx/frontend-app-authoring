import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'course-authoring.course-outline.unlink-modal.title',
    defaultMessage: 'Unlink {displayName}?',
    description: 'Title for the unlink confirmation modal',
  },
  titleComponent: {
    id: 'course-authoring.course-outline.unlink-modal.title-component',
    defaultMessage: 'Unlink this component?',
    description: 'Title for the unlink confirmation modal when the item is a component',
  },
  description: {
    id: 'course-authoring.course-outline.unlink-modal.description',
    defaultMessage: 'Are you sure you want to unlink this library {categoryName} reference?'
      + ' Unlinked blocks cannot be synced. <b>Unlinking is permanent.</b>',
    description: 'Description text in the unlink confirmation modal',
  },
  descriptionChildren: {
    id: 'course-authoring.course-outline.unlink-modal.description-children',
    defaultMessage: '{childrenCategoryName} contained in this {categoryName} will remain linked to '
      + 'their library versions.',
    description: 'Description text in the unlink confirmation modal when the item has children',
  },
  unlinkButton: {
    id: 'course-authoring.course-outline.unlink-modal.button.unlink',
    defaultMessage: 'Confirm Unlink',
  },
  pendingDeleteButton: {
    id: 'course-authoring.course-outline.unlink-modal.button.pending-unlink',
    defaultMessage: 'Unlinking',
  },
  cancelButton: {
    id: 'course-authoring.course-outline.unlink-modal.button.cancel',
    defaultMessage: 'Cancel',
  },
  chapterName: {
    id: 'course-authoring.course-outline.unlink-modal.chapter-name',
    defaultMessage: 'Section',
    description: 'Used to refer to a chapter in the course outline',
  },
  sequentialName: {
    id: 'course-authoring.course-outline.unlink-modal.sequential-name',
    defaultMessage: 'Subsection',
    description: 'Used to refer to a sequential in the course outline',
  },
  verticalName: {
    id: 'course-authoring.course-outline.unlink-modal.vertical-name',
    defaultMessage: 'Unit',
    description: 'Used to refer to a vertical in the course outline',
  },
  componentName: {
    id: 'course-authoring.course-outline.unlink-modal.component-name',
    defaultMessage: 'Component',
    description: 'Used to refer to a component in the course outline',
  },
  chapterChildrenName: {
    id: 'course-authoring.course-outline.unlink-modal.chapter-children-name',
    defaultMessage: 'Subsections',
    description: 'Used to refer to chapter children in the course outline',
  },
  sequentialChildrenName: {
    id: 'course-authoring.course-outline.unlink-modal.sequential-children-name',
    defaultMessage: 'Units',
    description: 'Used to refer to sequential children in the course outline',
  },
  verticalChildrenName: {
    id: 'course-authoring.course-outline.unlink-modal.vertical-children-name',
    defaultMessage: 'Components',
    description: 'Used to refer to vertical children in the course outline',
  },
});

export default messages;
