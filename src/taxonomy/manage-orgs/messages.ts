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
  confirmUnassignTitle: {
    id: 'course-authoring.taxonomy-manage-orgs.confirm-dialog.title',
    defaultMessage: 'Unassign taxonomy',
  },
  confirmUnassignText: {
    id: 'course-authoring.taxonomy-manage-orgs.confirm-dialog.text',
    defaultMessage: 'Content authors from unassigned organizations will not be able to tag course content with '
    + '{taxonomyName}. Are you sure you want to continue?',
  },
  continueButton: {
    id: 'course-authoring.taxonomy-manage-orgs.confirm-dialog.button.continue',
    defaultMessage: 'Continue',
  },
  assignOrgsSuccess: {
    id: 'course-authoring.taxonomy-manage-orgs.toast.assign-orgs-success',
    defaultMessage: 'Assigned organizations updated',
  },
  removeOrg: {
    id: 'course-authoring.taxonomy-manage-orgs.remove-org',
    defaultMessage: 'Remove {org}',
    description: 'button to remove a specific organization from a taxonomy',
  },
});

export default messages;
