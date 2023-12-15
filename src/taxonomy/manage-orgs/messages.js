// @ts-check
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headerTitle: {
    id: 'course-authoring.taxonomy-manage-orgs.header.title',
    defaultMessage: 'Assign to organizations',
  },
  bodyText: {
    id: 'course-authoring.taxonomy-manage-orgs.body.text',
    defaultMessage: 'Manage which organizations can access the taxonomy by assigning them in the menu below. You can '
    + 'also choose to assign the taxonomy to all organizations.',
  },
  assignOrgs: {
    id: 'course-authoring.taxonomy-manage-orgs.assign-orgs',
    defaultMessage: 'Assign organizations',
  },
  currentAssignments: {
    id: 'course-authoring.taxonomy-manage-orgs.current-assignments',
    defaultMessage: 'Currently assigned:',
  },
  addOrganizations: {
    id: 'course-authoring.taxonomy-manage-orgs.add-orgs',
    defaultMessage: 'Add another organization:',
  },
  searchOrganizations: {
    id: 'course-authoring.taxonomy-manage-orgs.search-orgs',
    defaultMessage: 'Search for an organization',
  },
  noOrganizationAssigned: {
    id: 'course-authoring.taxonomy-manage-orgs.no-orgs',
    defaultMessage: 'No organizations assigned',
  },
  assignAll: {
    id: 'course-authoring.taxonomy-manage-orgs.assign-all',
    defaultMessage: 'Assign to all organizations',
  },
  cancelButton: {
    id: 'course-authoring.taxonomy-manage-orgs.button.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'course-authoring.taxonomy-manage-orgs.button.save',
    defaultMessage: 'Save',
  },
});

export default messages;
