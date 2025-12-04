import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Article } from '@openedx/paragon/icons';
import {
  COMPONENT_TYPE_ICON_MAP,
  STRUCTURAL_TYPE_ICONS,
  COMPONENT_TYPE_STYLE_COLOR_MAP,
} from './constants';

import messages from './messages';

export function getItemIcon(blockType: string): React.ComponentType {
  return STRUCTURAL_TYPE_ICONS[blockType] ?? COMPONENT_TYPE_ICON_MAP[blockType] ?? Article;
}

export function getComponentStyleColor(blockType: string): string {
  return COMPONENT_TYPE_STYLE_COLOR_MAP[blockType] ?? COMPONENT_TYPE_STYLE_COLOR_MAP.other;
}

interface ComponentIconProps {
  blockType: string;
  iconTitle: string;
  text?: string;
  className?: string;
}

export const ComponentIcon = ({
  blockType,
  iconTitle,
  text,
  className,
}: ComponentIconProps) => (
  <div className={`rounded p-1 d-inline-flex ${getComponentStyleColor(blockType)} ${className}`}>
    <Icon
      src={getItemIcon(blockType)}
      screenReaderText={blockType}
      title={iconTitle}
    />
    {text && <span className="ml-1 small">{text}</span>}
  </div>
);

interface ComponentCountSnippetProps {
  componentData: Record<string, number>;
}

export const ComponentCountSnippet = ({ componentData }: ComponentCountSnippetProps) => {
  const intl = useIntl();

  const totalCount = componentData && Object.values(componentData).reduce((acc, val) => acc + val, 0);

  return (
    <div>
      {componentData && (
        <div className="d-inline-flex py-1 px-2 mr-2 border-right border-light">
          <Icon
            src={getItemIcon('components')}
            title={intl.formatMessage(messages.componentTotal)}
            className="mr-1"
          />
          <span className="small">
            {`${totalCount} ${intl.formatMessage(messages.componentTotal)}`}
          </span>
        </div>
      )}
      {componentData && Object.keys(componentData).map((blockType) => (
        <ComponentIcon
          key={blockType}
          blockType={blockType}
          iconTitle={blockType}
          text={componentData[blockType].toString()}
          className="px-2 mr-2"
        />
      ))}
    </div>
  );
};
