import { useConfigureSection, useCourseDetails, useCourseItemData } from "@src/course-outline/data/apiHooks";
import { ReleaseSection } from "./sharedSettings/ReleaseSection";
import { useCourseAuthoringContext } from "@src/CourseAuthoringContext";
import { SidebarContent } from "@src/generic/sidebar"
import { ConfigureSectionData } from "@src/course-outline/data/types";
import { VisibilityTypes } from "@src/data/constants";
import { VisibilitySection } from "./sharedSettings/VisibilitySection";

interface Props {
  sectionId: string;
}

export const SectionSettings = ({ sectionId }: Props) => {
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const { data: itemData, isPending } = useCourseItemData(sectionId);
  const { mutate } = useConfigureSection();

  const onChange = (variables: Partial<ConfigureSectionData>) => {
    if (isPending || !itemData) {
      return;
    }
    return mutate({
      sectionId: sectionId,
      isVisibleToStaffOnly: itemData.visibilityState === VisibilityTypes.STAFF_ONLY,
      startDatetime: itemData.start,
      ...variables,
    })
  }

  return (
    <SidebarContent>
      { !courseDetails?.selfPaced && <ReleaseSection
        itemId={sectionId}
        onChange={(val: string) => onChange({ startDatetime: val })}
      /> }
      <VisibilitySection
        itemId={sectionId}
        onChange={onChange}
      />
    </SidebarContent>
  )
}

