// @ts-check
import {
  Article,
} from '@openedx/paragon/icons';
import {
  COMPONENT_TYPE_ICON_MAP,
  STRUCTURAL_TYPE_ICONS,
  COMPONENT_TYPE_COLOR_MAP,
} from './constants';

/** @param {string} blockType */
export function getItemIcon(blockType) {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

/** @param {string} blockType */
export function getComponentColor(blockType) {
  return COMPONENT_TYPE_COLOR_MAP[blockType] ?? 'bg-component';
}
