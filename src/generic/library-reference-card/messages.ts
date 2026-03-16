import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  libraryReferenceCardText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.text',
    defaultMessage: 'Library Reference',
    description: 'Library reference card text in sidebar',
  },
  hasTopParentText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-text',
    defaultMessage: '{name} was reused as part of a {parentType}.',
    description: 'Text displayed in sidebar library reference card when a block was reused as part of a parent block',
  },
  hasTopParentBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-btn',
    defaultMessage: 'View {parentType}',
    description: 'Text displayed in sidebar library reference card button when a block was reused as part of a parent block',
  },
  hasTopParentReadyToSyncText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-sync-text',
    defaultMessage: '{name} was reused as part of a {parentType} which has updates available.',
    description: 'Text displayed in sidebar library reference card when a block has updates available as it was reused as part of a parent block',
  },
  hasTopParentReadyToSyncBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-sync-btn',
    defaultMessage: 'Review Updates',
    description: 'Text displayed in sidebar library reference card button when a block has updates available as it was reused as part of a parent block',
  },
  hasTopParentBrokenLinkText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-broken-link-text',
    defaultMessage: '{name} was reused as part of a {parentType} which has a broken link. To receive library updates to this component, unlink the broken link.',
    description: 'Text displayed in sidebar library reference card when a block was reused as part of a parent block which has a broken link.',
  },
  hasTopParentBrokenLinkBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.has-top-parent-broken-link-btn',
    defaultMessage: 'Unlink {parentType}',
    description: 'Text displayed in sidebar library reference card button when a block was reused as part of a parent block which has a broken link.',
  },
  topParentBrokenLinkText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-broken-link-text',
    defaultMessage: 'The link between {name} and the library version has been broken. To edit or make changes, unlink component.',
    description: 'Text displayed in sidebar library reference card when a block has a broken link.',
  },
  topParentBrokenLinkBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-broken-link-btn',
    defaultMessage: 'Unlink from library',
    description: 'Text displayed in sidebar library reference card button when a block has a broken link.',
  },
  topParentModifiedText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-modified-text',
    defaultMessage: '{name} has been modified in this course.',
    description: 'Text displayed in sidebar library reference card when it is modified in course.',
  },
  topParentReadyToSyncText: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-ready-to-sync-text',
    defaultMessage: '{name} has available updates',
    description: 'Text displayed in sidebar library reference card when it is has updates available.',
  },
  topParentReadyToSyncBtn: {
    id: 'course-authoring.course-outline.sidebar.library.reference.card.top-parent-ready-to-sync-btn',
    defaultMessage: 'Review Updates',
    description: 'Text displayed in sidebar library reference card button when it is has updates available.',
  },
});

export default messages;
