import { useParams } from 'react-router-dom';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';

/**
 * Align sidebar for unit or selected components.
 */
export const UnitAlignSidebar = () => {
  const { blockId } = useParams();
  const { currentComponentId } = useUnitSidebarContext();

  const sidebarContentId = currentComponentId || blockId;

  const {
    data: contentData,
  } = useContentData(sidebarContentId);

  return (
    <AlignSidebar
      title={
        contentData && 'displayName' in contentData
          ? contentData.displayName : ''
      }
      contentId={sidebarContentId || ''}
    />
  );
};
