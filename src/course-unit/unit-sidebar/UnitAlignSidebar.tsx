import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useContentData } from '@src/content-tags-drawer/data/apiHooks';
import { AlignSidebar } from '@src/generic/sidebar/AlignSidebar';
import { useUnitSidebarContext } from './UnitSidebarContext';

/**
 * Align sidebar for unit or selected components.
 */
export const UnitAlignSidebar = () => {
  const { blockId } = useParams();
  const { selectedComponentId, setCurrentPageKey } = useUnitSidebarContext();

  const sidebarContentId = selectedComponentId || blockId;

  const {
    data: contentData,
  } = useContentData(sidebarContentId);

  // istanbul ignore next
  const handleBack = useCallback(() => {
    // Set the align sidebar without current component to back
    // to unit align sidebar.
    setCurrentPageKey('align', null);
  }, [setCurrentPageKey]);

  return (
    <AlignSidebar
      title={
        contentData && 'displayName' in contentData
          ? contentData.displayName : ''
      }
      contentId={sidebarContentId || ''}
      onBackBtnClick={selectedComponentId ? handleBack : undefined}
    />
  );
};
