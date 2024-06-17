// @ts-check
import {
  Article,
  Folder,
} from '@openedx/paragon/icons';
import { COMPONENT_TYPE_ICON_MAP, TYPE_ICONS_MAP } from '../course-unit/constants';

const STRUCTURAL_TYPE_ICONS = {
  vertical: TYPE_ICONS_MAP.vertical,
  sequential: Folder,
  chapter: Folder,
};

/** @param {string} blockType */
export default function getItemIcon(blockType) {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}
