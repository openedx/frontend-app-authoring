import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  assignedToOrgsLabel: {
    id: 'course-authoring.taxonomy-list.orgs-count.label',
    defaultMessage: 'Assigned to {orgsCount} orgs',
  },
  competencyTypeIconAltText: {
    id: 'course-authoring.taxonomy-list.taxonomy-type-icon.competency.alt',
    defaultMessage: 'Competency taxonomy',
    description: 'Alt text for the competency taxonomy icon.',
  },
  tagsTypeIconAltText: {
    id: 'course-authoring.taxonomy-list.taxonomy-type-icon.tags.alt',
    defaultMessage: 'Tags taxonomy',
    description: 'Alt text for the tags taxonomy icon.',
  },
  applyCompetenciesButton: {
    id: 'course-authoring.taxonomy-list.button.apply-competencies.label',
    defaultMessage: 'Apply Competencies',
    description: 'Button on a competency taxonomy card that opens its competency management page.',
  },
});

export default messages;
