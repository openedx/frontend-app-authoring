import React from 'react';

import { useXBlockRender } from '../data/apiHooks';
import { getXBlockHandlerUrl } from '../data/api';
import { LibraryBlock } from '../LibraryBlock';

interface ComponentPreviewProps {
  usageKey: string;
}

const ComponentPreview = ({ usageKey }: ComponentPreviewProps) => {
  const { data: view } = useXBlockRender(usageKey);

  const getHandlerUrl = () => getXBlockHandlerUrl(usageKey, 'handler_name');

  return (
    <div>
      Hi, I am a component preview
      { view && <LibraryBlock getHandlerUrl={getHandlerUrl} view={view} /> }
    </div>

  );
};

export default ComponentPreview;
