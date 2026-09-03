import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  assignedToOrgsLabel: {
    id: 'course-authoring.taxonomy-list.orgs-count.label',
    defaultMessage: 'Assigned to {orgsCount} orgs',
  },
  competencyTypeIconAltText: {
    id: 'course-authoring.taxonomy-list.taxonomy-type-icon.competency.alt',
    defaultMessage: 'Competency taxonomy',
    description: 'Screen reader text for the icon on a taxonomy card that indicates the taxonomy is a competency taxonomy.',
  },
  tagsTypeIconAltText: {
    id: 'course-authoring.taxonomy-list.taxonomy-type-icon.tags.alt',
    defaultMessage: 'Tags taxonomy',
    description: 'Screen reader text for the icon on a taxonomy card that indicates the taxonomy is a tags taxonomy.',
  },
});

export default messages;
