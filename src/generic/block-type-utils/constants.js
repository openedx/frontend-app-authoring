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
  Folder,
} from '@openedx/paragon/icons';

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

export const STRUCTURAL_TYPE_ICONS = {
  vertical: TYPE_ICONS_MAP.vertical,
  sequential: Folder,
  chapter: Folder,
};

export const COMPONENT_TYPE_COLOR_MAP = {
  [COMPONENT_TYPES.advanced]: 'bg-other',
  [COMPONENT_TYPES.discussion]: 'bg-component',
  [COMPONENT_TYPES.library]: 'bg-component',
  [COMPONENT_TYPES.html]: 'bg-html',
  [COMPONENT_TYPES.openassessment]: 'bg-component',
  [COMPONENT_TYPES.problem]: 'bg-component',
  [COMPONENT_TYPES.video]: 'bg-video',
  [COMPONENT_TYPES.dragAndDrop]: 'bg-component',
  vertical: 'bg-vertical',
  sequential: 'bg-component',
  chapter: 'bg-component',
  collection: 'bg-collection',
};
