import {
  BackHand as BackHandIcon,
  BookOpen as BookOpenIcon,
  Edit as EditIcon,
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

export const COMPONENT_ICON_TYPES = ['advanced', 'discussion', 'library', 'openassessment', 'problem', 'video', 'drag-and-drop-v2'];

export const TYPE_ICONS_MAP = {
  video: VideoCameraIcon,
  other: BookOpenIcon,
  vertical: FormatListBulletedIcon,
  problem: EditIcon,
  lock: LockIcon,
};

export const COMPONENT_TYPE_ICON_MAP = {
  advanced: ScienceIcon,
  discussion: QuestionAnswerOutlineIcon,
  library: LibraryIcon,
  html: TextFieldsIcon,
  openassessment: EditIcon,
  problem: HelpOutlineIcon,
  video: VideoCameraIcon,
  'drag-and-drop-v2': BackHandIcon,
};
