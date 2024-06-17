// @ts-check
import COMPONENT_TYPE_COLOR_MAP from './constants';

/** @param {string} blockType */
export default function getComponentColor(blockType) {
  return COMPONENT_TYPE_COLOR_MAP[blockType] ?? 'bg-component';
}
