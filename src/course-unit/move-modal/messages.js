import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  moveModalTitle: {
    id: 'course-authoring.course-unit.xblock.move.modal.title',
    defaultMessage: 'Move: {displayName}',
    description: 'Text for the move modal heading',
  },
  moveModalCancelButton: {
    id: 'course-authoring.course-unit.xblock.move.modal.cancel.btn.text',
    defaultMessage: 'Cancel',
    description: 'Text for the button closing move modal of an XBlock',
  },
  moveModalSubmitButton: {
    id: 'course-authoring.course-unit.xblock.move.modal.submit.btn.text',
    defaultMessage: 'Move',
    description: 'Text for the button submitting move modal of an XBlock',
  },
  moveModalBreadcrumbsBaseCategory: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.core.category.text',
    defaultMessage: 'Course Outline',
    description: 'Text for the core breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsSections: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.sections.text',
    defaultMessage: 'Sections',
    description: 'Text for the sections breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsSubsections: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.subsections.text',
    defaultMessage: 'Subsections',
    description: 'Text for the subsections breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsUnits: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.units.text',
    defaultMessage: 'Units',
    description: 'Text for the units breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsComponents: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.components.text',
    defaultMessage: 'Components',
    description: 'Text for the components breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsGroups: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.groups.text',
    defaultMessage: 'Groups',
    description: 'Text for the groups breadcrumbs item in move modal of an XBlock',
  },
  moveModalBreadcrumbsLabel: {
    id: 'course-authoring.course-unit.xblock.move.modal.breadcrumbs.label.text',
    defaultMessage: 'Course Outline breadcrumb',
    description: 'Text for the breadcrumbs label in move modal of an XBlock',
  },
  moveModalEmptyCategoryText: {
    id: 'course-authoring.course-unit.xblock.move.modal.category.empty.text',
    defaultMessage: 'This {category} has no {categoryText}',
    description: 'Text for the category with empty children in move modal of an XBlock',
  },
  moveModalCategoryIndicatorAccessibilityText: {
    id: 'course-authoring.course-unit.xblock.move.modal.category.accessibility.text',
    defaultMessage: '{categoryText} in {displayName}',
    description: 'Text for the category indicator accessibility in move modal of an XBlock',
  },
  moveModalOutlineItemCurrentLocationText: {
    id: 'course-authoring.course-unit.xblock.move.modal.outline.item.location.text',
    defaultMessage: '(Current location)',
    description: 'Text for the outline item that indicates the current location in move modal of an XBlock',
  },
  moveModalOutlineItemCurrentComponentLocationText: {
    id: 'course-authoring.course-unit.xblock.move.modal.outline.item.component.location.text',
    defaultMessage: '(Currently selected)',
    description: 'Text for the outline item that indicates the current component location in move modal of an XBlock',
  },
  moveModalOutlineItemViewText: {
    id: 'course-authoring.course-unit.xblock.move.modal.outline.item.view.text',
    defaultMessage: 'View child items',
    description: 'Text for the outline item action description in move modal of an XBlock',
  },
});

export default messages;
