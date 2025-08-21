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
});

export default messages;
