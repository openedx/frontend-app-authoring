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
} from '@edx/paragon/icons';

export const UNIT_ICON_TYPES = ['video', 'other', 'vertical', 'problem', 'lock'];

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
