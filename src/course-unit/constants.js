import messages from './sidebar/messages';
import addComponentMessages from './add-component/messages';

export const getUnitReleaseStatus = (intl) => ({
  release: intl.formatMessage(messages.releaseStatusTitle),
  released: intl.formatMessage(messages.releasedStatusTitle),
  scheduled: intl.formatMessage(messages.scheduledStatusTitle),
});

export const UNIT_VISIBILITY_STATES = {
  staffOnly: 'staff_only',
  live: 'live',
  ready: 'ready',
};

export const ICON_COLOR_VARIANTS = {
  BLACK: '#000',
  GREEN: '#0D7D4D',
};

export const PUBLISH_TYPES = {
  republish: 'republish',
  discardChanges: 'discard_changes',
  makePublic: 'make_public',
};

export const getXBlockSupportMessages = (intl) => ({
  fs: { // Fully supported
    label: intl.formatMessage(addComponentMessages.modalComponentSupportLabelFullySupported),
    tooltip: intl.formatMessage(addComponentMessages.modalComponentSupportTooltipFullySupported),
  },
  ps: { // Provisionally supported
    label: intl.formatMessage(addComponentMessages.modalComponentSupportLabelProvisionallySupported),
    tooltip: intl.formatMessage(addComponentMessages.modalComponentSupportTooltipProvisionallySupported),
  },
  us: { // Not supported
    label: intl.formatMessage(addComponentMessages.modalComponentSupportLabelNotSupported),
    tooltip: intl.formatMessage(addComponentMessages.modalComponentSupportTooltipNotSupported),
  },
});

export const messageTypes = {
  refreshXBlock: 'refreshXBlock',
  showMoveXBlockModal: 'showMoveXBlockModal',
  completeXBlockMoving: 'completeXBlockMoving',
  rollbackMovedXBlock: 'rollbackMovedXBlock',
  showMultipleComponentPicker: 'showMultipleComponentPicker',
  showSingleComponentPicker: 'showSingleComponentPicker',
  addSelectedComponentsToBank: 'addSelectedComponentsToBank',
  showXBlockLibraryChangesPreview: 'showXBlockLibraryChangesPreview',
  copyXBlock: 'copyXBlock',
  manageXBlockAccess: 'manageXBlockAccess',
  completeManageXBlockAccess: 'completeManageXBlockAccess',
  deleteXBlock: 'deleteXBlock',
  completeXBlockDeleting: 'completeXBlockDeleting',
  duplicateXBlock: 'duplicateXBlock',
  completeXBlockDuplicating: 'completeXBlockDuplicating',
  newXBlockEditor: 'newXBlockEditor',
  toggleCourseXBlockDropdown: 'toggleCourseXBlockDropdown',
  addXBlock: 'addXBlock',
  scrollToXBlock: 'scrollToXBlock',
  handleViewXBlockContent: 'handleViewXBlockContent',
  handleViewGroupConfigurations: 'handleViewGroupConfigurations',
  editXBlock: 'editXBlock',
  closeXBlockEditorModal: 'closeXBlockEditorModal',
  saveEditedXBlockData: 'saveEditedXBlockData',
  completeXBlockEditing: 'completeXBlockEditing',
  studioAjaxError: 'studioAjaxError',
  refreshPositions: 'refreshPositions',
  openManageTags: 'openManageTags',
  showComponentTemplates: 'showComponentTemplates',
  addNewComponent: 'addNewComponent',
  pasteNewComponent: 'pasteComponent',
  copyXBlockLegacy: 'copyXBlockLegacy',
  hideProcessingNotification: 'hideProcessingNotification',
  handleRedirectToXBlockEditPage: 'handleRedirectToXBlockEditPage',
};
