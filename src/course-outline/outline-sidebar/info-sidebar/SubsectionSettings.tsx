import { FormattedMessage, useIntl } from "@edx/frontend-platform/i18n";
import { Button, ButtonGroup, Form, Stack } from "@openedx/paragon";
import { useConfigureSubsection, useCourseDetails, useCourseItemData } from "@src/course-outline/data/apiHooks";
import { ConfigureSubsectionData } from "@src/course-outline/data/types";
import { useOutlineSidebarContext } from "@src/course-outline/outline-sidebar/OutlineSidebarContext";
import { useCourseAuthoringContext } from "@src/CourseAuthoringContext";
import { VisibilityTypes } from "@src/data/constants";
import { DatepickerControl, DATEPICKER_TYPES } from "@src/generic/datepicker-control";
import { SidebarContent, SidebarSection } from "@src/generic/sidebar"
import { useStateWithCallback } from "@src/hooks";
import { FormEvent, useState } from "react";
import messages from './messages';

interface Props {
  subsectionId: string;
}

const defaultPrereqScore = (val: string | number | null | undefined) => {
  if (val === null || val === undefined) {
    return 100;
  }
  const parsed = parseFloat(val.toString());
  return isNaN(parsed) ? 100 : parsed;
};

interface SubProps extends Props {
  onChange: (variables: Partial<ConfigureSubsectionData>) => void;
}

const ReleaseSection = ({ subsectionId, onChange }: SubProps) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(subsectionId);
  const [localState, setLocalState] = useStateWithCallback(
    itemData?.start,
    (val) => onChange({ releaseDate: val }),
  );

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionReleaseTitle)}
    >
      <Stack className="mt-3" direction="horizontal" gap={3}>
        <DatepickerControl
          type={DATEPICKER_TYPES.date}
          value={localState}
          label={intl.formatMessage(messages.releaseDateLabel)}
          controlName="state-date"
          onChange={setLocalState}
        />
        <DatepickerControl
          type={DATEPICKER_TYPES.time}
          value={localState}
          label={intl.formatMessage(messages.releaseTimeLabel)}
          controlName="start-time"
          onChange={setLocalState}
        />
      </Stack>
    </SidebarSection>

  )
}

const GradingSection = ({ subsectionId, onChange }: SubProps) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(subsectionId);
  const [graded, setGraded] = useState(itemData?.graded);
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const [localState, setLocalState] = useStateWithCallback<Partial<ConfigureSubsectionData>>(
    {
      graderType: itemData?.format,
      dueDate: itemData?.due || '',
    },
    (val) => onChange(val || {})
  );

  const setUngraded = () => {
    setGraded(false);
    onChange({ graderType: "notgraded" });
  }

  const createOptions = () => itemData?.courseGraders?.map((option) => (
    <option key={option} value={option}> {option} </option>
  ));

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionGradingTitle)}
    >
      <ButtonGroup toggle>
        <Button
          variant={graded ? 'outline-primary' : 'primary'}
          onClick={setUngraded}
        >
          <FormattedMessage {...messages.subsectionGradingUngradedBtn} />
        </Button>
        <Button
          variant={graded ? 'primary' : 'outline-primary'}
          onClick={() => setGraded(true)}
        >
          <FormattedMessage {...messages.subsectionGradingGradedBtn} />
        </Button>
      </ButtonGroup>
      {graded &&
        <Form.Group>
          <Form.Label className="x-small">
            <FormattedMessage {...messages.subsectionGradingDropdownLabel} />
          </Form.Label>
          <Form.Control
            as="select"
            defaultValue={itemData?.format}
            onChange={(e) => setLocalState({ ...localState, graderType: e.target.value })}
            data-testid="grader-type-select"
          >
            <option key="notgraded" value="notgraded">
              {intl.formatMessage(messages.subsectionGradingDropdownPlaceholder)}
            </option>
            {createOptions()}
          </Form.Control>
        </Form.Group>
      }
      {!courseDetails?.selfPaced && graded &&
        <Stack className="mt-3" direction="horizontal" gap={3}>
          <DatepickerControl
            type={DATEPICKER_TYPES.date}
            value={localState?.dueDate}
            label={intl.formatMessage(messages.subsectionGradingDueDateLabel)}
            controlName="state-date"
            onChange={(val) => setLocalState({ ...localState, dueDate: val })}
            data-testid="due-date-picker"
          />
          <DatepickerControl
            type={DATEPICKER_TYPES.time}
            value={localState?.dueDate}
            label={intl.formatMessage(messages.subsectionGradingDueTimeLabel)}
            controlName="start-time"
            onChange={(val) => setLocalState({ ...localState, dueDate: val })}
          />
        </Stack>
      }
    </SidebarSection>
  );
}

export const SubsectionSettings = ({ subsectionId }: Props) => {
  const { courseId } = useCourseAuthoringContext();
  const { data: courseDetails } = useCourseDetails(courseId);
  const { data: itemData, isPending } = useCourseItemData(subsectionId);
  const { mutate } = useConfigureSubsection();
  const { selectedContainerState } = useOutlineSidebarContext();

  const onChange = (variables: Partial<ConfigureSubsectionData>) => {
    if (isPending || !itemData) {
      return;
    }
    return mutate({
      itemId: subsectionId,
      sectionId: selectedContainerState?.sectionId,
      isVisibleToStaffOnly: itemData.visibilityState === VisibilityTypes.STAFF_ONLY,
      releaseDate: itemData.start,
      graderType: itemData.format == null ? 'notgraded' : itemData.format,
      dueDate: itemData.due == null ? '' : itemData.due,
      isTimeLimited: itemData.isTimeLimited,
      isProctoredExam: itemData.isProctoredExam,
      isOnboardingExam: itemData.isOnboardingExam,
      isPracticeExam: itemData.isPracticeExam,
      examReviewRules: itemData.examReviewRules,
      defaultTimeLimitMin: itemData.defaultTimeLimitMinutes,
      hideAfterDue: itemData.hideAfterDue === undefined ? false : itemData.hideAfterDue,
      showCorrectness: itemData.showCorrectness,
      isPrereq: itemData.isPrereq,
      prereqUsageKey: itemData.prereq,
      prereqMinScore: defaultPrereqScore(itemData.prereqMinScore),
      prereqMinCompletion: defaultPrereqScore(itemData.prereqMinCompletion),
      ...variables,
    })
  }

  return (
    <SidebarContent>
      { !courseDetails?.selfPaced && <ReleaseSection
        subsectionId={subsectionId}
        onChange={onChange}
      /> }
      <GradingSection
        subsectionId={subsectionId}
        onChange={onChange}
      />
    </SidebarContent>
  )
}

