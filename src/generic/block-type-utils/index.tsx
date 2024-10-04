import React from 'react';
import { Article } from '@openedx/paragon/icons';
import {
  COMPONENT_TYPE_ICON_MAP,
  STRUCTURAL_TYPE_ICONS,
  COMPONENT_TYPE_STYLE_COLOR_MAP,
} from './constants';

export function getItemIcon(blockType: string): React.ComponentType {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

export function getComponentStyleColor(blockType: string): string {
  return COMPONENT_TYPE_STYLE_COLOR_MAP[blockType] ?? COMPONENT_TYPE_STYLE_COLOR_MAP.other;
}
