import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  openButton: {
    id: 'course-authoring.library-authoring.container-sidebar.open-button',
    defaultMessage: 'Open',
    description: 'Button text to open container',
  },
  previewTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.preview-tab.title',
    defaultMessage: 'Preview',
    description: 'Title for preview tab',
  },
  manageTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.title',
    defaultMessage: 'Manage',
    description: 'Title for manage tab',
  },
  manageTabTagsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.tags.title',
    defaultMessage: 'Tags ({count})',
    description: 'Title for tags section in manage tab',
  },
  manageTabCollectionsTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.manage-tab.collections.title',
    defaultMessage: 'Collections ({count})',
    description: 'Title for collections section in manage tab',
  },
  usageTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.usage-tab.title',
    defaultMessage: 'Usage',
    description: 'Title for usage tab',
  },
  usageTabHierarchyHeading: {
    id: 'course-authoring.library-authoring.container-sidebar.usage-tab.hierarchy-heading',
    defaultMessage: 'Content Hierarchy',
    description: 'Heading for usage tab hierarchy section',
  },
  settingsTabTitle: {
    id: 'course-authoring.library-authoring.container-sidebar.settings-tab.title',
    defaultMessage: 'Settings',
    description: 'Title for settings tab',
  },
  updateContainerSuccessMsg: {
    id: 'course-authoring.library-authoring.update-container-success-msg',
    defaultMessage: 'Container updated successfully.',
    description: 'Message displayed when container is updated successfully',
  },
  updateContainerErrorMsg: {
    id: 'course-authoring.library-authoring.update-container-error-msg',
    defaultMessage: 'Failed to update container.',
    description: 'Message displayed when container update fails',
  },
  removeComponentFromCollectionSuccess: {
    id: 'course-authoring.library-authoring.component.remove-from-collection-success',
    defaultMessage: 'Item successfully removed',
    description: 'Message for successful removal of an item from collection.',
  },
  removeComponentFromCollectionFailure: {
    id: 'course-authoring.library-authoring.component.remove-from-collection-failure',
    defaultMessage: 'Failed to remove item',
    description: 'Message for failure of removal of an item from collection.',
  },
  containerCardMenuAlt: {
    id: 'course-authoring.library-authoring.container.menu',
    defaultMessage: 'Container actions menu',
    description: 'Alt/title text for the container card menu button.',
  },
  menuOpen: {
    id: 'course-authoring.library-authoring.menu.open',
    defaultMessage: 'Open',
    description: 'Menu item for open a collection/container.',
  },
  menuCopyContainer: {
    id: 'course-authoring.library-authoring.container.copy-menu-text',
    defaultMessage: 'Copy to clipboard',
    description: 'Menu item to copy a container.',
  },
  menuDeleteContainer: {
    id: 'course-authoring.library-authoring.container.delete-menu-text',
    defaultMessage: 'Delete',
    description: 'Menu item to delete a container.',
  },
  menuRemoveFromContainer: {
    id: 'course-authoring.library-authoring.component.menu.remove',
    defaultMessage: 'Remove from {containerType}',
    description: 'Menu item for remove an item from container.',
  },
  menuAddToCollection: {
    id: 'course-authoring.library-authoring.component.menu.add',
    defaultMessage: 'Add to collection',
    description: 'Menu item for add a component to collection.',
  },
  containerPreviewMoreBlocks: {
    id: 'course-authoring.library-authoring.component.container-card-preview.more-blocks',
    defaultMessage: '+{count}',
    description: 'Count shown when a container has more blocks than will fit on the card preview.',
  },
  containerPreviewText: {
    id: 'course-authoring.library-authoring.container.preview.text',
    defaultMessage: 'Contains {children}.',
    description: 'Preview message for section/subsections with the names of children separated by commas',
  },
  deleteSectionWarningTitle: {
    id: 'course-authoring.library-authoring.section.delete-confirmation-title',
    defaultMessage: 'Delete Section',
    description: 'Title text for the warning displayed before deleting a Section',
  },
  deleteSectionCourseMessage: {
    id: 'course-authoring.library-authoring.section.delete-parent-message',
    defaultMessage: 'This section is used {courseCount, plural, one {{courseCountText} time} other {{courseCountText} times}} in courses, and will stop receiving updates there.',
    description: 'Course usage details shown before deleting a section',
  },
  deleteSubsectionParentMessage: {
    id: 'course-authoring.library-authoring.subsection.delete-parent-message',
    defaultMessage: 'By deleting this subsection, you will also be deleting it from {parentName} in this library.',
    description: 'Parent usage details shown before deleting a subsection',
  },
  deleteSubsectionMultipleParentMessage: {
    id: 'course-authoring.library-authoring.subsection.delete-multiple-parent-message',
    defaultMessage: 'By deleting this subsection, you will also be deleting it from {parentCount} Sections in this library.',
    description: 'Parent usage details shown before deleting a subsection part of multiple sections',
  },
  deleteSubsectionWarningTitle: {
    id: 'course-authoring.library-authoring.subsection.delete-confirmation-title',
    defaultMessage: 'Delete Subsection',
    description: 'Title text for the warning displayed before deleting a Subsection',
  },
  deleteSubsectionCourseMessage: {
    id: 'course-authoring.library-authoring.subsection.delete-course-message',
    defaultMessage: 'This subsection is used {courseCount, plural, one {{courseCountText} time} other {{courseCountText} times}} in courses, and will stop receiving updates there.',
    description: 'Course usage details shown before deleting a subsection',
  },
  deleteUnitParentMessage: {
    id: 'course-authoring.library-authoring.unit.delete-parent-message',
    defaultMessage: 'By deleting this unit, you will also be deleting it from {parentName} in this library.',
    description: 'Parent usage details shown before deleting a unit',
  },
  deleteUnitMultipleParentMessage: {
    id: 'course-authoring.library-authoring.unit.delete-multiple-parent-message',
    defaultMessage: 'By deleting this unit, you will also be deleting it from {parentCount} Subsections in this library.',
    description: 'Parent usage details shown before deleting a unit part of multiple subsections',
  },
  deleteUnitWarningTitle: {
    id: 'course-authoring.library-authoring.unit.delete-confirmation-title',
    defaultMessage: 'Delete Unit',
    description: 'Title text for the warning displayed before deleting a Unit',
  },
  deleteUnitCourseMessage: {
    id: 'course-authoring.library-authoring.unit.delete-course-usage-message',
    defaultMessage: 'This unit is used {courseCount, plural, one {{courseCountText} time} other {{courseCountText} times}} in courses, and will stop receiving updates there.',
    description: 'Course usage details shown before deleting a unit',
  },
  deleteContainerConfirm: {
    id: 'course-authoring.library-authoring.container.delete-confirmation-text',
    defaultMessage: 'Are you sure you want to permanently delete {containerName}? This cannot be undone and will remove it from your library. {message}',
    description: 'Confirmation text to display before deleting a container',
  },
  deleteUnitSuccess: {
    id: 'course-authoring.library-authoring.unit.delete.success',
    defaultMessage: 'Unit deleted',
    description: 'Message to display on delete unit success',
  },
  deleteUnitFailed: {
    id: 'course-authoring.library-authoring.unit.delete-failed-error',
    defaultMessage: 'Failed to delete unit',
    description: 'Message to display on failure to delete a unit',
  },
  undoDeleteUnitToastFailed: {
    id: 'course-authoring.library-authoring.unit.undo-delete-unit-failed',
    defaultMessage: 'Failed to undo delete Unit operation',
    description: 'Message to display on failure to undo delete unit',
  },
  deleteSectionSuccess: {
    id: 'course-authoring.library-authoring.section.delete.success',
    defaultMessage: 'Section deleted',
    description: 'Message to display on delete section success',
  },
  deleteSectionFailed: {
    id: 'course-authoring.library-authoring.section.delete-failed-error',
    defaultMessage: 'Failed to delete section',
    description: 'Message to display on failure to delete a section',
  },
  undoDeleteSectionToastFailed: {
    id: 'course-authoring.library-authoring.section.undo-delete-section-failed',
    defaultMessage: 'Failed to undo delete Section operation',
    description: 'Message to display on failure to undo delete section',
  },
  deleteSubsectionSuccess: {
    id: 'course-authoring.library-authoring.subsection.delete.success',
    defaultMessage: 'Subsection deleted',
    description: 'Message to display on delete subsection success',
  },
  deleteSubsectionFailed: {
    id: 'course-authoring.library-authoring.subsection.delete-failed-error',
    defaultMessage: 'Failed to delete subsection',
    description: 'Message to display on failure to delete a subsection',
  },
  undoDeleteSubsectionToastFailed: {
    id: 'course-authoring.library-authoring.subsection.undo-delete-subsection-failed',
    defaultMessage: 'Failed to undo delete Subsection operation',
    description: 'Message to display on failure to undo delete subsection',
  },
  undoDeleteContainerToastMessage: {
    id: 'course-authoring.library-authoring.container.undo-delete-container-toast-text',
    defaultMessage: 'Undo successful',
    description: 'Message to display on undo delete container success',
  },
  undoDeleteContainerToastAction: {
    id: 'course-authoring.library-authoring.container.undo-delete-container-toast-button',
    defaultMessage: 'Undo',
    description: 'Toast message to undo deletion of container',
  },
  publishContainerSuccess: {
    id: 'course-authoring.library-authoring.container-sidebar.publisher.publish-success',
    defaultMessage: 'All changes published',
    description: 'Popup text after publishing a container',
  },
  publishContainerFailed: {
    id: 'course-authoring.library-authoring.container-sidebar.publisher.publish-failure',
    defaultMessage: 'Failed to publish changes',
    description: 'Popup text seen if publishing a container fails',
  },
});

export default messages;
