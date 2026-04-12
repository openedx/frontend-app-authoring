import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, useToggle } from '@openedx/paragon';
import { PUBLISH_TYPES, UNIT_VISIBILITY_STATES } from '@src/course-unit/constants';
import { UserPartitionInfoTypes } from '@src/data/types';
import { AccessEditComponent, DiscussionEditComponent } from '@src/generic/configure-modal/UnitTab';
import { SidebarContent, SidebarSection } from '@src/generic/sidebar';
import { Form, Formik } from 'formik';
import { useMemo } from 'react';
import configureMessages from '@src/generic/configure-modal/messages';
import { useConfigureUnit } from '@src/course-outline/data/apiHooks';
import { useStateWithCallback } from '@src/hooks';
import ModalNotification from '@src/generic/modal-notification';
import { InfoOutline } from '@openedx/paragon/icons';
import messages from './messages';

interface UnitInfoSettingsProps {
  id: string;
  visibilityState: string;
  discussionEnabled?: boolean;
  userPartitionInfo?: UserPartitionInfoTypes;
  updateCallback?: () => void;
  sectionId?: string;
  subsectionId?: string;
  configureHook?: typeof useConfigureUnit;
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
    sectionId,
    subsectionId,
    configureHook = useConfigureUnit,
  } = props;

  const visibleToStaffOnly = visibilityState === UNIT_VISIBILITY_STATES.staffOnly;
  const mutateFn = configureHook();
  const [isVisibleModalOpen, openVisibleModal, closeVisibleModal] = useToggle(false);

  const handleUpdate = (
    isVisible: boolean,
    groupAccess: Record<string, any> | null,
    isDiscussionEnabled?: boolean,
  ) => {
    // oxlint-disable-next-line @typescript-eslint/await-thenable - this dispatch() IS returning a promise.
    mutateFn.mutate({
      unitId: id,
      type: PUBLISH_TYPES.republish,
      isVisibleToStaffOnly: isVisible,
      groupAccess,
      discussionEnabled: !!isDiscussionEnabled,
      sectionId,
      subsectionId,
    }, {
      onSuccess: () => props.updateCallback?.(),
    });
  };

  const [localState, setLocalState] = useStateWithCallback<{
    isVisible?: boolean;
    isDiscussionEnabled?: boolean;
  }>({
    isVisible: visibleToStaffOnly,
    isDiscussionEnabled: discussionEnabled,
  }, (val) => {
    if (val) {
      handleUpdate(!!val.isVisible, null, val.isDiscussionEnabled);
    }
  });

  const handleSaveGroups = async (data: {
    selectedPartitionIndex: number;
    selectedGroups: any[];
  }, { resetForm }: any) => {
    const groupAccess = {};
    if (userPartitionInfo && data.selectedPartitionIndex >= 0) {
      const partitionId = userPartitionInfo.selectablePartitions[data.selectedPartitionIndex].id;
      groupAccess[partitionId] = data.selectedGroups.map(g => parseInt(g, 10));
    }
    handleUpdate(visibleToStaffOnly, groupAccess, !!discussionEnabled);
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

  const setStudentVisible = () => {
    closeVisibleModal();
    setLocalState((prev) => ({ ...prev, isVisible: false }));
  };

  const initialValues = useMemo(() => (
    {
      selectedPartitionIndex: userPartitionInfo?.selectedPartitionIndex,
      selectedGroups: getSelectedGroups(),
    }
  ), [userPartitionInfo]);

  return (
    <>
      <SidebarContent>
        <SidebarSection
          title={intl.formatMessage(messages.sidebarInfoVisibilityTitle)}
        >
          <ButtonGroup toggle>
            <Button
              variant={localState?.isVisible ? 'outline-primary' : 'primary'}
              onClick={openVisibleModal}
            >
              <FormattedMessage {...messages.sidebarInfoVisibilityStudentLabel} />
            </Button>
            <Button
              variant={localState?.isVisible ? 'primary' : 'outline-primary'}
              onClick={() => setLocalState((prev) => ({ ...prev, isVisible: true }))}
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
            discussionEnabled={!!localState?.isDiscussionEnabled}
            handleDiscussionChange={(e) => setLocalState((prev) => ({
              ...prev,
              isDiscussionEnabled: e.target.checked,
            }))}
          />
        </SidebarSection>
      </SidebarContent>
      <ModalNotification
        title={intl.formatMessage(messages.modalMakeVisibilityTitle)}
        isOpen={isVisibleModalOpen}
        actionButtonText={intl.formatMessage(messages.modalMakeVisibilityActionButtonText)}
        cancelButtonText={intl.formatMessage(messages.modalMakeVisibilityCancelButtonText)}
        handleAction={setStudentVisible}
        handleCancel={closeVisibleModal}
        message={intl.formatMessage(messages.modalMakeVisibilityDescription)}
        icon={InfoOutline}
      />
    </>
  );
};
