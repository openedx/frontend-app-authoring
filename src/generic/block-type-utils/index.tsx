import React from 'react';
import { Article } from '@openedx/paragon/icons';
import {
  COMPONENT_TYPE_ICON_MAP,
  STRUCTURAL_TYPE_ICONS,
  COMPONENT_TYPE_COLOR_MAP,
} from './constants';

export function getItemIcon(blockType: string): React.ComponentType {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

export function getComponentColor(blockType: string): string {
  return COMPONENT_TYPE_COLOR_MAP[blockType] ?? 'bg-component';
}
