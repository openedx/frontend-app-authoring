import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, Form } from '@openedx/paragon';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ConfigureSubsectionData } from '@src/course-outline/data/types';
import { VisibilityTypes } from '@src/data/constants';
import { SidebarSection } from '@src/generic/sidebar';
import { useStateWithCallback } from '@src/hooks';
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
  const [localState, setLocalState] = useStateWithCallback<State>(
    {
      isVisibleToStaffOnly: itemData?.visibilityState === VisibilityTypes.STAFF_ONLY,
      hideAfterDue: itemData?.hideAfterDue,
    },
    (val) => {
      if (val && !isSubsection) {
        val.hideAfterDue = undefined;
      }
      return onChange(val || {});
    },
  );

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
          onClick={() => setLocalState((prev) => ({
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
        onChange={(e) => setLocalState((prev) => ({
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
