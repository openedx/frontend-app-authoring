import { useIntl } from "@edx/frontend-platform/i18n";
import { Stack } from "@openedx/paragon";
import { useCourseItemData } from "@src/course-outline/data/apiHooks";
import { DatepickerControl, DATEPICKER_TYPES } from "@src/generic/datepicker-control";
import { SidebarSection } from "@src/generic/sidebar";
import { useStateWithCallback } from "@src/hooks";
import messages from '../messages';

interface Props {
  itemId: string;
  onChange: (val?: string) => void;
}

export const ReleaseSection = ({ itemId, onChange }: Props) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(itemId);
  const [localState, setLocalState] = useStateWithCallback(
    itemData?.start,
    (val) => onChange(val),
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
