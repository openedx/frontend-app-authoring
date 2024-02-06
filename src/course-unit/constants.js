import {
  BookOpen as BookOpenIcon,
  Edit as EditIcon,
  FormatListBulleted as FormatListBulletedIcon,
  Lock as LockIcon,
  VideoCamera as VideoCameraIcon,
} from '@edx/paragon/icons';

export const UNIT_ICON_TYPES = ['video', 'other', 'vertical', 'problem', 'lock'];

export const TYPE_ICONS_MAP = {
  video: VideoCameraIcon,
  other: BookOpenIcon,
  vertical: FormatListBulletedIcon,
  problem: EditIcon,
  lock: LockIcon,
};
