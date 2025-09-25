import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  StandardModal,
  useToggle
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DotsVertical, File05, Plus } from '@untitledui/icons';
import { COURSE_BLOCK_NAMES } from '../constants';
import { RequestStatus } from '../data/constants';
import ConfigureModal from '../generic/configure-modal/ConfigureModal';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import Loading from '../generic/Loading';
import ProcessingNotification from '../generic/processing-notification';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import getPageHeadTitle from '../generic/utils';
import Button from '../shared/Components/Common/Button';
import AddComponent from './add-component/AddComponent';
import { getCourseUnitData } from './data/selectors';
import { useCourseUnit, useScrollToLastPosition } from './hooks';
import messages from './messages';
import XBlockContainerIframe from './xblock-container-iframe';

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const [isNewComponentModalOpen, openNewComponentModal, closeNewComponentModal] = useToggle(false);
  const [isConfigureModalOpen, openConfigureModal, closeConfigureModal] = useToggle(false);
  const {
    isLoading,
    courseUnitLoadingStatus,
    unitTitle,
    sequenceStatus,
    isUnitVerticalType,
    isSplitTestType,
    unitXBlockActions,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    addComponentTemplateData,
  } = useCourseUnit({ courseId, blockId });
  const currentItemData = useSelector(getCourseUnitData);
  const isXBlockComponent = [
    COURSE_BLOCK_NAMES.libraryContent.id,
    COURSE_BLOCK_NAMES.splitTest.id,
    COURSE_BLOCK_NAMES.component.id,
  ].includes(currentItemData.category);

  useEffect(() => {
    document.title = getPageHeadTitle('', unitTitle);
  }, [unitTitle]);

  useScrollToLastPosition();

  const onConfigureSubmit = (...arg) => {
    handleConfigureSubmit(currentItemData.id, ...arg, closeConfigureModal);
  };

  const { isShow: isShowProcessingNotification, title: processingNotificationTitle } =
    useSelector(getProcessingNotification);

  if (isLoading) {
    return <Loading />;
  }

  if (sequenceStatus === RequestStatus.FAILED) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  return (
    <div className="tw-flex tw-flex-col tw-gap-8">
      <div className="tw-flex tw-gap-3">
        <div className="tw-flex tw-flex-col tw-gap-2 tw-flex-1">
          <div className="tw-flex tw-items-center tw-gap-2">
            <File05 className="tw-text-brand-500 tw-size-4" />
            <span className="tw-text-gray- tw-text-sm tw-font-semibold">{intl.formatMessage(messages.pageTitle)}</span>
          </div>
          <span className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-break-words tw-wrap-anywhere tw-hyphens-auto">{unitTitle}</span>
        </div>
        <div className="tw-flex tw-gap-3">
          <Button
            variant="secondary"
            size="sm"
            iconBefore={Plus}
            labels={{ default: intl.formatMessage(messages.newComponentButtonText) }}
            className="!tw-w-auto !tw-h-10 tw-border-gray-300 tw-text-gray-700 !tw-py-[10px] !tw-px-[14px] focus:!tw-border"
            onClick={openNewComponentModal}
          />
          <button 
            className="tw-bg-transparent tw-border-0 tw-size-10 tw-flex tw-items-center tw-justify-center tw-p-[10px]"
            onClick={() => {
              // TODO: Implement the Unit setting dropdown for this button in MVP
              // openConfigureModal();
            }}
          >
            <DotsVertical className="tw-text-gray-600 tw-size-5 hover:tw-text-gray-700" />
          </button>
        </div>
      </div>

      <div className="tw-flex tw-flex-col tw-gap-4">
        <XBlockContainerIframe
          courseId={courseId}
          blockId={blockId}
          isUnitVerticalType={isUnitVerticalType}
          courseUnitLoadingStatus={courseUnitLoadingStatus}
          unitXBlockActions={unitXBlockActions}
          courseVerticalChildren={courseVerticalChildren.children}
          handleConfigureSubmit={handleConfigureSubmit}
        />
        <button
          className="tw-text-brand-700 tw-font-semibold tw-text-sm tw-mb-4 tw-bg-[rgba(255,255,255,0.7)] hover:!tw-bg-brand-600 hover:!tw-text-white tw-border tw-border-white tw-border-solid tw-rounded-[100px] tw-py-4 !tw-px-0 tw-flex tw-justify-center tw-items-center tw-gap-[6px]"
          onClick={openNewComponentModal}
        >
          <Plus className="tw-size-5" />
          <span>{intl.formatMessage(messages.newComponentButtonText)}</span>
        </button>
      </div>

      {/* New Component Modal */}
      <StandardModal
        title={intl.formatMessage(messages.newComponentModalTitle)}
        isOpen={isNewComponentModalOpen}
        onClose={closeNewComponentModal}
        size="lg"
        isOverflowVisible={false}
      >
        <AddComponent
          parentLocator={blockId}
          isSplitTestType={isSplitTestType}
          isUnitVerticalType={isUnitVerticalType}
          handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
          addComponentTemplateData={addComponentTemplateData}
          onCloseNewComponentModal={closeNewComponentModal}
        />
      </StandardModal>

      {/* Unit Settings Modal */}
      <ConfigureModal
        isOpen={isConfigureModalOpen}
        onClose={closeConfigureModal}
        onConfigureSubmit={onConfigureSubmit}
        currentItemData={currentItemData}
        isSelfPaced={false}
        isXBlockComponent={isXBlockComponent}
        userPartitionInfo={currentItemData?.userPartitionInfo || {}}
      />
      <ProcessingNotification
        isShow={isShowProcessingNotification}
        title={processingNotificationTitle}
      />
    </div>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseUnit;
