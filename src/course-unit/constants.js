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

export const UNIT_ICON_TYPES = ['video', 'other', 'vertical', 'problem', 'lock'];

export const NOT_XBLOCK_TYPES = ['vertical', 'sequential', 'chapter', 'course'];

export const STUDIO_CLIPBOARD_CHANNEL = 'studio_clipboard_channel';

/**
 * Enum for clipboard status.
 * @readonly
 * @enum {string}
 */
export const CLIPBOARD_STATUS = {
  loading: 'loading',
  ready: 'ready',
  expired: 'expired',
  error: 'error',
};

export const COMPONENT_ICON_TYPES = {
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
  [COMPONENT_ICON_TYPES.advanced]: ScienceIcon,
  [COMPONENT_ICON_TYPES.discussion]: QuestionAnswerOutlineIcon,
  [COMPONENT_ICON_TYPES.library]: LibraryIcon,
  [COMPONENT_ICON_TYPES.html]: TextFieldsIcon,
  [COMPONENT_ICON_TYPES.openassessment]: EditNoteIcon,
  [COMPONENT_ICON_TYPES.problem]: HelpOutlineIcon,
  [COMPONENT_ICON_TYPES.video]: VideoCameraIcon,
  [COMPONENT_ICON_TYPES.dragAndDrop]: BackHandIcon,
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
