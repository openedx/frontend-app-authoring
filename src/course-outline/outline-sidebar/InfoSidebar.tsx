import { useOutlineSidebarContext } from "./OutlineSidebarContext";
import { CourseInfoSidebar } from "./CourseInfoSidebar"
import { ContainerType, getBlockType } from "@src/generic/key-utils";
import { SectionSidebar } from "./SectionnfoSidebar";

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
      return <div>Subsection sidebar</div>;
    case ContainerType.Vertical:
    case ContainerType.Unit:
      return <div>Unit sidebar</div>;
    default:
      return <CourseInfoSidebar />;
  }
}

