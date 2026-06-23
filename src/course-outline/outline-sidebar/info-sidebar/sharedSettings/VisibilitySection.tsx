import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, Form } from '@openedx/paragon';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ConfigureSubsectionData } from '@src/course-outline/data/types';
import { VisibilityTypes } from '@src/data/constants';
import { SidebarSection } from '@src/generic/sidebar';
import { useFieldDraft } from '@src/hooks/useFieldDraft';
import { useMemo } from 'react';
import messages from '../messages';

interface Props<T = Partial<ConfigureSubsectionData>> {
  itemId: string;
  isSubsection?: boolean;
  onChange: (variables: T) => void;
}

interface State {
  isVisibleToStaffOnly?: boolean;
  hideAfterDue?: boolean;
}

export const VisibilitySection = ({ itemId, isSubsection, onChange }: Props) => {
  const intl = useIntl();
  const { data: itemData } = useCourseItemData(itemId);

  const serverState = useMemo<State>(() => ({
    isVisibleToStaffOnly: itemData?.visibilityState === VisibilityTypes.STAFF_ONLY,
    hideAfterDue: itemData?.hideAfterDue,
  }), [itemData?.visibilityState, itemData?.hideAfterDue]);

  const [localState, setLocalState] = useFieldDraft<State>(serverState, (val) => {
    const payload = { ...val };
    if (!isSubsection) {
      payload.hideAfterDue = undefined;
    }
    return onChange(payload);
  });

  return (
    <SidebarSection
      title={intl.formatMessage(messages.subsectionVisibilityTitle)}
    >
      <ButtonGroup toggle>
        <Button
          variant={localState?.isVisibleToStaffOnly ? 'outline-primary' : 'primary'}
          onClick={() => setLocalState((prev) => ({ ...prev, isVisibleToStaffOnly: false }))}
        >
          <FormattedMessage {...messages.subsectionVisibilityStudentVisible} />
        </Button>
        <Button
          variant={localState?.isVisibleToStaffOnly ? 'primary' : 'outline-primary'}
          onClick={() =>
            setLocalState((prev) => ({
              ...prev,
              isVisibleToStaffOnly: true,
              hideAfterDue: false,
            }))}
        >
          <FormattedMessage {...messages.subsectionVisibilityStaffOnly} />
        </Button>
      </ButtonGroup>
      {isSubsection && !localState?.isVisibleToStaffOnly && (
        <Form.Checkbox
          checked={localState?.hideAfterDue}
          className="mt-2"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLocalState((prev) => ({
              ...prev,
              hideAfterDue: e.target.checked,
              isVisibleToStaffOnly: false,
            }))}
        >
          <FormattedMessage {...messages.subsectionVisibilityHideAfterDueLabel} />
        </Form.Checkbox>
      )}
    </SidebarSection>
  );
};
