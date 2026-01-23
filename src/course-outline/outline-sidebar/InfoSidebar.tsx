import { useOutlineSidebarContext } from "./OutlineSidebarContext";
import { CourseInfoSidebar } from "./CourseInfoSidebar"
import { ContainerType, getBlockType } from "@src/generic/key-utils";
import { SectionSidebar } from "./SectionInfoSidebar";
import { SubsectionSidebar } from "./SubsectionInfoSidebar";
import { UnitSidebar } from "./UnitInfoSidebar";

export const InfoSidebar = () => {
  const { selectedContainerState } = useOutlineSidebarContext();
  if (!selectedContainerState) {
    return (
      <CourseInfoSidebar />
    )
  }
  const itemType = getBlockType(selectedContainerState.currentId);

  switch (itemType) {
    case ContainerType.Chapter:
    case ContainerType.Section:
      return <SectionSidebar sectionId={selectedContainerState.currentId} />
    case ContainerType.Sequential:
    case ContainerType.Subsection:
      return <SubsectionSidebar subsectionId={selectedContainerState.currentId} />
    case ContainerType.Vertical:
    case ContainerType.Unit:
      return <UnitSidebar unitId={selectedContainerState.currentId} />
    default:
      return <CourseInfoSidebar />;
  }
}

