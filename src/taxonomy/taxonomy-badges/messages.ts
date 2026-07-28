import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  disabledBadge: {
    id: 'course-authoring.taxonomy-list.badge.disabled.label',
    defaultMessage: 'Disabled',
  },
  freeTextLabel: {
    id: 'course-authoring.taxonomy-list.badge.freeText.label',
    defaultMessage: 'Free text',
    description: 'Label that indicates a free-text taxonomy where new tag values can be created at any time.',
  },
  singleTagLabel: {
    id: 'course-authoring.taxonomy-list.badge.singleTag.label',
    defaultMessage: 'Single tag only',
    description: 'Label that indicates a taxonomy that does not allow multiple tags per object.',
  },
  systemTaxonomyPopoverTitle: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.title',
    defaultMessage: 'System taxonomy',
  },
  orgsAll: {
    id: 'course-authoring.taxonomy-list.badge.orgsAllLabel',
    defaultMessage: 'All orgs',
    description: 'Label when a taxonomy is enabled for use by all organizations.',
  },
  orgsCount: {
    id: 'course-authoring.taxonomy-list.badge.orgsAllLabel',
    defaultMessage: '{orgsCount, plural, one {{orgsCount} org} other {{orgsCount} orgs}}',
    description: 'Label that indicates how many organizations the taxonomy is enabled for.',
  },
  systemTaxonomyPopoverBody: {
    id: 'course-authoring.taxonomy-list.popover.system-defined.body',
    defaultMessage: 'This is a system-level taxonomy and is enabled by default.',
  },
  systemDefinedBadge: {
    id: 'course-authoring.taxonomy-list.badge.system-defined.label',
    defaultMessage: 'System-level',
  },
});

export default messages;
