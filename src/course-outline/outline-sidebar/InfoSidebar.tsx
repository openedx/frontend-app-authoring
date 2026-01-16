import { useOutlineSidebarContext } from "./OutlineSidebarContext";
import { CourseInfoSidebar } from "./CourseInfoSidebar"
import { ContainerType, getBlockType } from "@src/generic/key-utils";
import { SectionSidebar } from "./SectionInfoSidebar";
import { SubsectionSidebar } from "@src/course-outline/outline-sidebar/SubsectionInfoSidebar";

export const InfoSidebar = () => {
  const { selectedContainerId } = useOutlineSidebarContext();
  if (!selectedContainerId) {
    return (
      <CourseInfoSidebar />
    )
  }
  const itemType = getBlockType(selectedContainerId);

  switch (itemType) {
    case ContainerType.Chapter:
    case ContainerType.Section:
      return <SectionSidebar sectionId={selectedContainerId} />
    case ContainerType.Sequential:
    case ContainerType.Subsection:
      return <SubsectionSidebar subsectionId={selectedContainerId} />
    case ContainerType.Vertical:
    case ContainerType.Unit:
      return <div>Unit sidebar</div>;
    default:
      return <CourseInfoSidebar />;
  }
}

