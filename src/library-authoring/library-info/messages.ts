import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  editNameButtonAlt: {
    id: 'course-authoring.library-authoring.sidebar.info.edit-name.alt',
    defaultMessage: 'Edit library name',
    description: 'Alt text for edit library name icon button',
  },
  organizationSectionTitle: {
    id: 'course-authoring.library-authoring.sidebar.info.organization.title',
    defaultMessage: 'Organization',
    description: 'Title for Organization section in Library info sidebar.',
  },
  libraryTeamButtonTitle: {
    id: 'course-authoring.library-authoring.sidebar.info.library-team.button.title',
    defaultMessage: 'Manage Access',
    description: 'Title to use for the button that allows viewing/editing the Library Team user access.',
  },
  libraryHistorySectionTitle: {
    id: 'course-authoring.library-authoring.sidebar.info.history.title',
    defaultMessage: 'Library History',
    description: 'Title for Library History section in Library info sidebar.',
  },
  lastModifiedLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.history.last-modified',
    defaultMessage: 'Last Modified',
    description: 'Last Modified label used in Library History section.',
  },
  createdLabel: {
    id: 'course-authoring.library-authoring.sidebar.info.history.created',
    defaultMessage: 'Created',
    description: 'Created label used in Library History section.',
  },
  publishSuccessMsg: {
    id: 'course-authoring.library-authoring.publish.success',
    defaultMessage: 'Library published successfully',
    description: 'Message when the library is published successfully.',
  },
  publishErrorMsg: {
    id: 'course-authoring.library-authoring.publish.error',
    defaultMessage: 'There was an error publishing the library.',
    description: 'Message when there is an error when publishing the library.',
  },
  revertSuccessMsg: {
    id: 'course-authoring.library-authoring.revert.success',
    defaultMessage: 'Library changes reverted successfully',
    description: 'Message when the library changes are reverted successfully.',
  },
  revertErrorMsg: {
    id: 'course-authoring.library-authoring.publish.error',
    defaultMessage: 'There was an error reverting changes in the library.',
    description: 'Message when there is an error when reverting changes in the library.',
  },
  updateLibrarySuccessMsg: {
    id: 'course-authoring.library-authoring.library.update.success',
    defaultMessage: 'Library updated successfully',
    description: 'Message when the library is updated successfully',
  },
  updateLibraryErrorMsg: {
    id: 'course-authoring.library-authoring.library.update.error',
    defaultMessage: 'There was an error updating the library',
    description: 'Message when there is an error when updating the library',
  },
  discardChangesTitle: {
    id: 'course-authoring.library-authoring.library.discardChangesTitle',
    defaultMessage: 'Discard changes',
    description: 'Title text for confirmation modal shown before discard library changes',
  },
  discardChangesDescription: {
    id: 'course-authoring.library-authoring.library.discardChangesDescription',
    defaultMessage: 'Are you sure you want to discard all unpublished changes in this library? This will include changes made by other users',
    description: 'Description text for confirmation modal shown before discard library changes',
  },
  discardChangesDefaultBtnLabel: {
    id: 'course-authoring.library-authoring.library.discardChangesDefaultBtnLabel',
    defaultMessage: 'Discard',
    description: 'Button text for confirmation modal shown before discard library changes',
  },
});

export default messages;
