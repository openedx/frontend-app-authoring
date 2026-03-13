import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup } from '@openedx/paragon';
import { PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from '@src/course-unit/constants';
import { editCourseUnitVisibilityAndData } from '@src/course-unit/data/thunk';
import { UserPartitionInfoTypes } from '@src/data/types';
import { AccessEditComponent, DiscussionEditComponent } from '@src/generic/configure-modal/UnitTab';
import { SidebarContent, SidebarSection } from '@src/generic/sidebar';
import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import configureMessages from '@src/generic/configure-modal/messages';
import { useEditCourseUnitVisibilityAndData } from '@src/course-unit/data/apiHooks';
import messages from './messages';

interface UnitInfoSettingsProps {
  id: string;
  visibilityState: string;
  discussionEnabled?: boolean;
  userPartitionInfo?: UserPartitionInfoTypes;
  updateCallback?: () => void;
}

/**
 * Generic Component with forms to edit unit settings.
 *
 * It is used in settings tab of unit sidebar in both outline and unit page
 */
export const GenericUnitInfoSettings = (props: UnitInfoSettingsProps) => {
  const intl = useIntl();
  const {
    id,
    visibilityState,
    discussionEnabled,
    userPartitionInfo,
  } = props;

  const visibleToStaffOnly = visibilityState === UNIT_VISIBILITY_STATES.staffOnly;
  const mutateFn = useEditCourseUnitVisibilityAndData();

  const handleUpdate = async (
    isVisible: boolean,
    groupAccess: Record<string, any> | null,
    isDiscussionEnabled?: boolean,
  ) => {
    // oxlint-disable-next-line @typescript-eslint/await-thenable - this dispatch() IS returning a promise.
    await mutateFn.mutateAsync({
      unitId: id,
      type: PUBLISH_TYPES.republish,
      isVisible,
      groupAccess,
      isDiscussionEnabled: !!isDiscussionEnabled,
    }, {
      onSuccess: () => props.updateCallback?.(),
    });
  };

  const handleSaveGroups = async (data, { resetForm }) => {
    const groupAccess = {};
    if (userPartitionInfo && data.selectedPartitionIndex >= 0) {
      const partitionId = userPartitionInfo.selectablePartitions[data.selectedPartitionIndex].id;
      groupAccess[partitionId] = data.selectedGroups.map(g => parseInt(g, 10));
    }
    await handleUpdate(visibleToStaffOnly, groupAccess, !!discussionEnabled);
    resetForm({ values: data });
  };

  /* istanbul ignore next */
  const getSelectedGroups = () => {
    if (userPartitionInfo && userPartitionInfo.selectedPartitionIndex >= 0) {
      return userPartitionInfo.selectablePartitions[userPartitionInfo?.selectedPartitionIndex]
        ?.groups
        .filter(({ selected }) => selected)
        // eslint-disable-next-line @typescript-eslint/no-shadow
        .map(({ id }) => `${id}`)
        || [];
    }
    return [];
  };

  const initialValues = useMemo(() => (
    {
      selectedPartitionIndex: userPartitionInfo?.selectedPartitionIndex,
      selectedGroups: getSelectedGroups(),
    }
  ), [userPartitionInfo]);

  return (
    <SidebarContent>
      <SidebarSection
        title={intl.formatMessage(messages.sidebarInfoVisibilityTitle)}
      >
        <ButtonGroup toggle>
          <Button
            variant={visibleToStaffOnly ? 'outline-primary' : 'primary'}
            onClick={() => handleUpdate(false, null, discussionEnabled)}
          >
            <FormattedMessage {...messages.sidebarInfoVisibilityStudentLabel} />
          </Button>
          <Button
            variant={visibleToStaffOnly ? 'primary' : 'outline-primary'}
            onClick={() => handleUpdate(true, null, discussionEnabled)}
          >
            <FormattedMessage {...messages.sidebarInfoVisibilityStaffLabel} />
          </Button>
        </ButtonGroup>
      </SidebarSection>
      <SidebarSection
        title={intl.formatMessage(messages.sidebarInfoAccessTitle)}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSaveGroups}
        >
          {({
            values, setFieldValue, dirty,
          }) => (
            <Form>
              <AccessEditComponent
                selectedPartitionIndex={values.selectedPartitionIndex}
                setFieldValue={setFieldValue}
                userPartitionInfo={userPartitionInfo}
                selectedGroups={values.selectedGroups}
              />
              {dirty && (
                <Button className="mt-3" type="submit" variant="primary">
                  <FormattedMessage {...messages.visibilitySaveGroupsButton} />
                </Button>
              )}
            </Form>
          )}
        </Formik>
      </SidebarSection>
      <SidebarSection
        title={intl.formatMessage(configureMessages.discussionEnabledSectionTitle)}
      >
        <DiscussionEditComponent
          discussionEnabled={!!discussionEnabled}
          handleDiscussionChange={(e) => handleUpdate(visibleToStaffOnly, null, e.target.checked)}
        />
      </SidebarSection>
    </SidebarContent>
  );
};
