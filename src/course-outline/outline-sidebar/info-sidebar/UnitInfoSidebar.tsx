import { useContext, useState } from 'react';
import { isEmpty } from 'lodash';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Stack, Tab, Tabs,
} from '@openedx/paragon';
import {
  OpenInFull,
} from '@openedx/paragon/icons';

import { getItemIcon } from '@src/generic/block-type-utils';

import { SidebarTitle } from '@src/generic/sidebar';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import Loading from '@src/generic/Loading';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import XBlockContainerIframe from '@src/course-unit/xblock-container-iframe';
import { IframeProvider } from '@src/generic/hooks/context/iFrameContext';
import { Link, useNavigate } from 'react-router-dom';
import { getLibraryId } from '@src/generic/key-utils';
import { possibleUnitMoves } from '@src/course-outline/drag-helper/utils';
import { useOutlineSidebarContext } from '../OutlineSidebarContext';
import { PublishButon } from './PublishButon';
import messages from '../messages';
import { InfoSection } from './InfoSection';
import { useClipboard } from '@src/generic/clipboard';
import { ToastContext } from '@src/generic/toast-context';

export const UnitSidebar = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'preview' | 'info' | 'settings'>('info');
  const { selectedContainerState, clearSelection, setSelectedContainerState } = useOutlineSidebarContext();
  const {
    currentId: unitId = /* istanbul ignore next */ '',
    index,
  } = selectedContainerState ?? {};
  const { data: unitData, isLoading } = useCourseItemData(unitId);
  const {
    openPublishModal,
    getUnitUrl,
    courseId,
    handleDuplicateUnitSubmit,
    sections,
    updateUnitOrderByIndex,
    openDeleteModal,
    openUnlinkModal,
  } = useCourseAuthoringContext();
  const { copyToClipboard } = useClipboard();
  const { showToast } = useContext(ToastContext);

  const handlePublish = () => {
    if (unitData?.hasChanges) {
      openPublishModal({
        value: unitData,
        sectionId: selectedContainerState?.sectionId,
        subsectionId: selectedContainerState?.subsectionId,
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Resolve section and subsection from selectedContainerState indices
  const sectionIndex = selectedContainerState?.sectionIndex;
  const section = sectionIndex !== undefined ? sections[sectionIndex] : undefined;
  const subsectionIndex = section && selectedContainerState?.subsectionId
    ? section.childInfo.children.findIndex((s) => s.id === selectedContainerState.subsectionId)
    : -1;
  const subsection = subsectionIndex !== -1 ? section?.childInfo.children[subsectionIndex] : undefined;

  // Build move calculator only when all ancestor context is available
  const getPossibleMoves = (section && subsection && subsectionIndex !== -1)
    ? possibleUnitMoves(
      [...sections],
      sectionIndex ?? -1,
      subsectionIndex,
      section,
      subsection,
      subsection.childInfo.children,
    )
    : undefined;

  const canMoveUnit = (oldIndex: number, step: number) => {
    if (getPossibleMoves) {
      const moveDetails = getPossibleMoves(oldIndex, step);
      return !isEmpty(moveDetails);
    }
    /* istanbul ignore next */
    return false;
  };

  const handleMove = (step: number) => {
    if (section && subsection && getPossibleMoves && index !== undefined && sectionIndex !== undefined) {
      const moveDetails = getPossibleMoves(index, step);
      // section is the current parent section (used as prevSection in cross-section moves)
      updateUnitOrderByIndex(section, moveDetails);
      if (!isEmpty(moveDetails)) {
        const newSectionId = moveDetails.sectionId;
        const newSubsectionId = moveDetails.subsectionId;
        // Cross-subsection move: unit goes to end of previous or start of next subsection
        const isCrossSubsection = newSubsectionId !== subsection.id;
        /* istanbul ignore next */
        const newSectionIndex = newSectionId !== section.id
          ? sections.findIndex((s) => s.id === newSectionId)
          : sectionIndex;
        /* istanbul ignore next */
        const newIndex = isCrossSubsection
          ? (step === -1
            ? sections[newSectionIndex].childInfo.children.find((s) => s.id === newSubsectionId)?.childInfo.children.length ?? 0
            : 0)
          : index + step;
        /* istanbul ignore next */
        setSelectedContainerState(selectedContainerState ? {
          ...selectedContainerState,
          sectionId: newSectionId,
          sectionIndex: newSectionIndex,
          subsectionId: newSubsectionId,
          index: newIndex,
        } : undefined);
      }
    }
  };

  const handleCopyLocation = () => {
    // Extract the location ID: the part after "block@" at the end of the usage key
    // e.g. "block-v1:org+course+run+type@vertical+block@abc123" → "abc123"
    const locationId = unitId.match(/block@(.+)$/)?.[1];
    if (!locationId) {
      /* istanbul ignore next */
      return;
    }

    if (navigator.clipboard) {
      // Modern approach: requires HTTPS (secure context)
      void navigator.clipboard.writeText(locationId);
    } else /* istanbul ignore next */ {
      // Fallback for HTTP (non-secure) dev environments
      // Note: execCommand is deprecated but still widely supported as fallback
      const textarea = document.createElement('textarea');
      textarea.value = locationId;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy'); // eslint-disable-line deprecation/deprecation
      document.body.removeChild(textarea);
    }
    showToast(intl.formatMessage(messages.locationCopiedText));
  };

  return (
    <>
      <SidebarTitle
        title={unitData?.displayName || ''}
        icon={getItemIcon(unitData?.category || '')}
        onBackBtnClick={clearSelection}
        menuProps={{
          itemId: unitId,
          index: index ?? -1,
          canMoveItem: canMoveUnit,
          onClickDuplicate: handleDuplicateUnitSubmit,
          onClickMoveUp: () => handleMove(-1),
          onClickMoveDown: () => handleMove(1),
          onClickUnlink: () => openUnlinkModal({
            value: unitData,
            sectionId: selectedContainerState?.sectionId,
            subsectionId: selectedContainerState?.subsectionId,
          }),
          onClickDelete: openDeleteModal,
          onClickViewLibrary: () => {
            const upstreamRef = unitData?.upstreamInfo?.upstreamRef;
            if (upstreamRef) {
              const libId = getLibraryId(upstreamRef);
              navigate(`/library/${libId}/unit/${upstreamRef}`);
            }
          },
          onClickCopy: /* istanbul ignore next */ () => copyToClipboard(unitId),
          onClickCopyLocation: handleCopyLocation,
        }}
      />
      <Stack direction="horizontal" gap={1} className="mx-2">
        <Button
          variant="outline-primary"
          as={Link}
          to={getUnitUrl(unitId)}
          iconBefore={OpenInFull}
          block={!unitData?.hasChanges}
        >
          {intl.formatMessage(messages.openUnitPage)}
        </Button>
        {unitData?.hasChanges && (
          <PublishButon onClick={handlePublish} />
        )}
      </Stack>
      <Tabs
        variant="tabs"
        className="my-2 mx-n3.5"
        id="add-content-tabs"
        activeKey={tab}
        onSelect={setTab}
        mountOnEnter
      >
        <Tab
          eventKey="preview"
          title={intl.formatMessage(messages.previewTabText)}
          // To make sure that data is fresh
          unmountOnExit
        >
          <IframeProvider>
            <XBlockContainerIframe
              courseId={courseId}
              blockId={unitId}
              isUnitVerticalType={false}
              unitXBlockActions={{ handleDelete: () => {}, handleDuplicate: () => {}, handleUnlink: () => {} }}
              courseVerticalChildren={[]}
              handleConfigureSubmit={() => {}}
              readonly
            />
          </IframeProvider>
        </Tab>
        <Tab eventKey="info" title={intl.formatMessage(messages.infoTabText)}>
          <InfoSection itemId={unitId} />
        </Tab>
        <Tab eventKey="settings" title={intl.formatMessage(messages.settingsTabText)}>
          <div>Settings</div>
        </Tab>
      </Tabs>
    </>
  );
};
