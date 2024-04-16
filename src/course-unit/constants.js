import {
  BackHand as BackHandIcon,
  BookOpen as BookOpenIcon,
  Edit as EditIcon,
  EditNote as EditNoteIcon,
  FormatListBulleted as FormatListBulletedIcon,
  HelpOutline as HelpOutlineIcon,
  LibraryAdd as LibraryIcon,
  Lock as LockIcon,
  QuestionAnswerOutline as QuestionAnswerOutlineIcon,
  Science as ScienceIcon,
  TextFields as TextFieldsIcon,
  VideoCamera as VideoCameraIcon,
} from '@openedx/paragon/icons';

import messages from './sidebar/messages';
import addComponentMessages from './add-component/messages';

export const UNIT_ICON_TYPES = ['video', 'other', 'vertical', 'problem', 'lock'];

export const COMPONENT_TYPES = {
  advanced: 'advanced',
  discussion: 'discussion',
  library: 'library',
  html: 'html',
  openassessment: 'openassessment',
  problem: 'problem',
  video: 'video',
  dragAndDrop: 'drag-and-drop-v2',
};

export const TYPE_ICONS_MAP = {
  video: VideoCameraIcon,
  other: BookOpenIcon,
  vertical: FormatListBulletedIcon,
  problem: EditIcon,
  lock: LockIcon,
};

export const COMPONENT_TYPE_ICON_MAP = {
  [COMPONENT_TYPES.advanced]: ScienceIcon,
  [COMPONENT_TYPES.discussion]: QuestionAnswerOutlineIcon,
  [COMPONENT_TYPES.library]: LibraryIcon,
  [COMPONENT_TYPES.html]: TextFieldsIcon,
  [COMPONENT_TYPES.openassessment]: EditNoteIcon,
  [COMPONENT_TYPES.problem]: HelpOutlineIcon,
  [COMPONENT_TYPES.video]: VideoCameraIcon,
  [COMPONENT_TYPES.dragAndDrop]: BackHandIcon,
};

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
