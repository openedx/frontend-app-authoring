import { ContainerType, getBlockType } from '@src/generic/key-utils';
import { useOutlineSidebarContext } from '../OutlineSidebarContext';
import { CourseInfoSidebar } from './CourseInfoSidebar';
import { SectionSidebar } from './SectionInfoSidebar';
import { SubsectionSidebar } from './SubsectionInfoSidebar';
import { UnitSidebar } from './UnitInfoSidebar';

export const InfoSidebar = () => {
  const { selectedContainerState } = useOutlineSidebarContext();
  if (!selectedContainerState) {
    return (
      <CourseInfoSidebar />
    );
  }
  const itemType = getBlockType(selectedContainerState.currentId);

  switch (itemType) {
    case ContainerType.Chapter:
    case ContainerType.Section:
      return <SectionSidebar />;
    case ContainerType.Sequential:
    case ContainerType.Subsection:
      return <SubsectionSidebar />;
    case ContainerType.Vertical:
    case ContainerType.Unit:
      return <UnitSidebar />;
    default:
      return <CourseInfoSidebar />;
  }
};
