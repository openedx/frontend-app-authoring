import React from 'react';

import { LibraryBlock } from '../LibraryBlock';
import { getXBlockHandlerUrl } from '../data/api';
import { useXBlockRender } from '../data/apiHooks';

interface ComponentPreviewProps {
  usageKey: string;
}

const ComponentPreview = ({ usageKey }: ComponentPreviewProps) => {
  const { data: view } = useXBlockRender(usageKey);

  const getHandlerUrl = () => getXBlockHandlerUrl(usageKey);

  return (
    <div>
      Hi, I am a component preview
      { view && <LibraryBlock getHandlerUrl={getHandlerUrl} view={view} /> }
    </div>

  );
};

export default ComponentPreview;
