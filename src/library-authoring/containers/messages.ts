import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  draftChipText: {
    id: 'course-authoring.library-authoring.container-component.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in children in section and subsection page that is shown when children has unpublished changes',
  },
  publishedChipText: {
    id: 'course-authoring.library-authoring.container-component.published-chip.text',
    defaultMessage: 'Published',
    description: 'Text shown when a unit/section/subsection is published.',
  },
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
  publishContainerButton: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-button',
    defaultMessage: 'Publish Changes {publishStatus}',
    description: 'Button text to initiate publish the unit/subsection/section, showing current publish status',
  },
  publishContainerConfirmHeading: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-confirm-heading',
    defaultMessage: 'Confirm Publish',
    description: 'Header text shown while confirming publish of a unit/subsection/section',
  },
  publishContainerConfirm: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-confirm-button',
    defaultMessage: 'Publish',
    description: 'Button text shown to confirm publish of a unit/subsection/section',
  },
  publishContainerCancel: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-cancel',
    defaultMessage: 'Cancel',
    description: 'Button text shown to cancel publish of a unit/subsection/section',
  },
  publishContainerSuccess: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-success',
    defaultMessage: 'All changes published',
    description: 'Popup text after publishing a unit/subsection/section',
  },
  publishContainerFailed: {
    id: 'course-authoring.library-authoring.container-sidebar.publish-failure',
    defaultMessage: 'Failed to publish changes',
    description: 'Popup text seen if publishing a unit/subsection/section fails',
  },
  publishSectionWarning: {
    id: 'course-authoring.library-authoring.section-sidebar.publish-empty-warning',
    defaultMessage: 'Are you sure you want to publish this section?',
    description: 'Content details shown before publishing a empty section',
  },
  publishSectionWithChildrenWarning: {
    id: 'course-authoring.library-authoring.section-sidebar.publish-warning',
    defaultMessage: 'This section and its {childCount, plural, one {{childCount} subsection} other {{childCount} subsections}} will all be published.',
    description: 'Content details shown before publishing a section',
  },
  publishSubsectionWarning: {
    id: 'course-authoring.library-authoring.subsection-sidebar.publish-empty-warning',
    defaultMessage: 'Are you sure you want to publish this subsection?',
    description: 'Content details shown before publishing an empty subsection',
  },
  publishSubsectionWithChildrenWarning: {
    id: 'course-authoring.library-authoring.subsection-sidebar.publish-warning',
    defaultMessage: 'This subsection and its {childCount, plural, one {{childCount} unit} other {{childCount} units}} will all be published.',
    description: 'Content details shown before publishing a subsection',
  },
  publishUnitWarning: {
    id: 'course-authoring.library-authoring.unit-sidebar.publish-empty-warning',
    defaultMessage: 'Are you sure you want to publish this unit?',
    description: 'Content details shown before publishing an empty unit',
  },
  publishUnitWithChildrenWarning: {
    id: 'course-authoring.library-authoring.unit-sidebar.publish-warning',
    defaultMessage: 'This unit and its {childCount, plural, one {{childCount} component} other {{childCount} components}} will all be published.',
    description: 'Content details shown before publishing a unit',
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
  deleteSectionCourseMessaage: {
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
  deleteSubsectionCourseMessaage: {
    id: 'course-authoring.library-authoring.subsection.delete-parent-message',
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
  deleteUnitConfirm: {
    id: 'course-authoring.library-authoring.unit.delete-confirmation-text',
    defaultMessage: 'Delete {unitName}? {message}',
    description: 'Confirmation text to display before deleting a unit',
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
});

export default messages;
