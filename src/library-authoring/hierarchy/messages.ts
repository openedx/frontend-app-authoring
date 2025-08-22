import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  willPublishChipText: {
    id: 'course-authoring.library-authoring.container-component.hierarchy.will-publish-chip.text',
    defaultMessage: 'Will Publish',
    description: 'Text shown when a component/unit/section/subsection will be published when confirmed.',
  },
  draftChipText: {
    id: 'course-authoring.library-authoring.container-component.hierarchy.draft-chip.text',
    defaultMessage: 'Draft',
    description: 'Chip in component/container that is shown when has unpublished changes',
  },
  publishedChipText: {
    id: 'course-authoring.library-authoring.container-component.hierarchy.published-chip.text',
    defaultMessage: 'Published',
    description: 'Text shown when a unit/section/subsection/component is published.',
  },
  hierarchySections: {
    id: 'course-authoring.library-authoring.container-sidebar.hierarchy-sections',
    defaultMessage: '{count, plural, one {{displayName}} other {{count} Sections}}',
    description: (
      'Text used for the section part of the hierarchy: show the displayName when there is one, or '
      + 'the count when there is more than one.'
    ),
  },
  hierarchySubsections: {
    id: 'course-authoring.library-authoring.container-sidebar.hierarchy-subsections',
    defaultMessage: '{count, plural, one {{displayName}} other {{count} Subsections}}',
    description: (
      'Text used for the subsection part of the hierarchy: show the displayName when there is one, or '
      + 'the count when there is more than one.'
    ),
  },
  hierarchyUnits: {
    id: 'course-authoring.library-authoring.container-sidebar.hierarchy-units',
    defaultMessage: '{count, plural, one {{displayName}} other {{count} Units}}',
    description: (
      'Text used for the unit part of the hierarchy: show the displayName when there is one, or '
      + 'the count when there is more than one.'
    ),
  },
  hierarchyComponents: {
    id: 'course-authoring.library-authoring.container-sidebar.hierarchy-components',
    defaultMessage: '{count, plural, one {{displayName}} other {{count} Components}}',
    description: (
      'Text used for the components part of the hierarchy: show the displayName when there is one, or '
      + 'the count when there is more than one.'
    ),
  },
  publishSectionWithChildrenWarning: {
    id: 'course-authoring.library-authoring.section-sidebar.hierarchy-publisher.publish-warning',
    defaultMessage: (
      'This section and the {childCount, plural, one {subsection} other {subsections}}'
      + ' it contains will all be <highlight>published</highlight>.'
    ),
    description: 'Content details shown before publishing a section that contains subsections',
  },
  publishSectionWarning: {
    id: 'course-authoring.library-authoring.section-sidebar.hierarchy-publisher.publish-empty-warning',
    defaultMessage: 'This section will be <highlight>published</highlight>.',
    description: 'Content details shown before publishing an empty section',
  },
  publishSubsectionWithChildrenWarning: {
    id: 'course-authoring.library-authoring.subsection-sidebar.hierarchy-publisher.publish-warning',
    defaultMessage: (
      'This subsection and the {childCount, plural, one {unit} other {units}}'
      + ' it contains will all be <highlight>published</highlight>.'
    ),
    description: 'Content details shown before publishing a subsection that contains units',
  },
  publishSubsectionWarning: {
    id: 'course-authoring.library-authoring.subsection-sidebar.hierarchy-publisher.publish-empty-warning',
    defaultMessage: 'This subsection will be <highlight>published</highlight>.',
    description: 'Content details shown before publishing an empty subsection',
  },
  publishUnitWithChildrenWarning: {
    id: 'course-authoring.library-authoring.unit-sidebar.hierarchy-publisher.publish-warning',
    defaultMessage: (
      'This unit and the {childCount, plural, one {component} other {components}}'
      + ' it contains will all be <highlight>published</highlight>.'
    ),
    description: 'Content details shown before publishing a unit that contains components',
  },
  publishUnitWarning: {
    id: 'course-authoring.library-authoring.unit-sidebar.hierarchy-publisher.publish-empty-warning',
    defaultMessage: 'This unit will be <highlight>published</highlight>.',
    description: 'Content details shown before publishing an empty unit',
  },
  publishSubsectionWithParentWarning: {
    id: 'course-authoring.library-authoring.subsection-sidebar.hierarchy-publisher.publish-parent-warning',
    defaultMessage: (
      'Its {parentCount, plural, one {parent section} other {parent sections}}'
      + ' will be <highlight>draft</highlight>.'
    ),
    description: 'Parent details shown before publishing a unit that has one or more parent subsections',
  },
  publishUnitWithParentWarning: {
    id: 'course-authoring.library-authoring.unit-sidebar.hierarchy-publisher.publish-parent-warning',
    defaultMessage: (
      'Its {parentCount, plural, one {parent subsection} other {parent subsections}}'
      + ' will be <highlight>draft</highlight>.'
    ),
    description: 'Parent details shown before publishing a unit that has one or more parent subsections',
  },
  publishConfirmHeading: {
    id: 'course-authoring.library-authoring.item-sidebar.hierarchy-publisher.publish-confirm-heading',
    defaultMessage: 'Confirm Publish',
    description: 'Header text shown while confirming publish of a unit/subsection/section',
  },
  publishCancel: {
    id: 'course-authoring.library-authoring.item-sidebar.hierarchy-publisher.publish-cancel',
    defaultMessage: 'Cancel',
    description: 'Button text shown to cancel publish of a unit/subsection/section',
  },
  publishConfirm: {
    id: 'course-authoring.library-authoring.item-sidebar.hierarchy-publisher.publish-confirm-button',
    defaultMessage: 'Publish',
    description: 'Button text shown to confirm publish of a unit/subsection/section',
  },
  empty: {
    id: 'course-authoring.library-authoring.item-sidebar.hierarchy-publisher.empty',
    defaultMessage: 'No child',
    description: 'Message when the item has no children',
  },
  publishComponentWarning: {
    id: 'course-authoring.library-authoring.component-sidebar.hierarchy-publisher.publish-empty-warning',
    defaultMessage: 'This component will be <highlight>published</highlight>.',
    description: 'Content details shown before publishing an empty unit',
  },
  publishComponentsWithParentWarning: {
    id: 'course-authoring.library-authoring.component-sidebar.hierarchy-publisher.publish-parent-warning',
    defaultMessage: (
      'Its {parentCount, plural, one {parent unit} other {parent units}}'
      + ' will be <highlight>draft</highlight>.'
    ),
    description: 'Parent details shown before publishing a component that has one or more parent units',
  },
});

export default messages;
