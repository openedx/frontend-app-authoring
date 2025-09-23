import { useIntl } from '@edx/frontend-platform/i18n';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { OverlayTrigger, Toast, Tooltip } from '@openedx/paragon';
import { LayoutLeft, Rocket02 } from '@untitledui/icons';
import classNames from 'classnames';
import Badge from 'shared/Components/Common/Badge';
import { RequestStatus } from '../../data/constants';
import { useModel } from '../../generic/model-store';
import {
  hideProcessingNotification
} from '../../generic/processing-notification/data/slice';
import { useContentMenuItems, useSettingMenuItems, useToolsMenuItems } from '../../header/hooks';
import Button from '../../shared/Components/Common/Button';
import { formatToDate } from '../../utils';
import { ITEM_BADGE_STATUS } from '../constants';
import { publishCourseSection } from '../data/api';
import { getSectionsList } from '../data/selectors';
import { updateSavingStatus } from '../data/slice';
import { fetchCourseSectionQuery } from '../data/thunk';
import courseOutlineMessages from '../messages';
import { getItemStatus } from '../utils';
import MenuItem from './MenuItem';
import messages from './messages';
import PublishCourseModal from './PublishCourseModal';
import { getCourseRunFromCourseId } from './utils';

interface CourseSidebarProps {
  courseId: string;
}

const RocketIcon = () => <Rocket02 className="!tw-size-5" />;

const CourseSidebar: React.FC<CourseSidebarProps> = ({ courseId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const courseDetails = useModel('courseDetails', courseId);
  const sectionsList = useSelector(getSectionsList);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Get menu items using the same hooks as the header
  const contentMenuItems = useContentMenuItems(courseId);
  const settingMenuItems = useSettingMenuItems(courseId);
  const toolsMenuItems = useToolsMenuItems(courseId);

  // Build the navigation tree similar to header
  const mainMenuDropdowns = [
    {
      id: `${intl.formatMessage({ id: 'header.links.content', defaultMessage: 'Content' })}-dropdown-menu`,
      title: intl.formatMessage({ id: 'header.links.content', defaultMessage: 'Content' }),
      items: contentMenuItems,
    },
    {
      id: `${intl.formatMessage({ id: 'header.links.settings', defaultMessage: 'Settings' })}-dropdown-menu`,
      title: intl.formatMessage({ id: 'header.links.settings', defaultMessage: 'Settings' }),
      items: settingMenuItems,
    },
    {
      id: `${intl.formatMessage({ id: 'header.links.tools', defaultMessage: 'Tools' })}-dropdown-menu`,
      title: intl.formatMessage({ id: 'header.links.tools', defaultMessage: 'Tools' }),
      items: toolsMenuItems,
    },
  ];

  const handlePublishCourse = () => {
    setIsPublishModalOpen(true);
  };

  const handleClosePublishModal = () => {
    setIsPublishModalOpen(false);
  };

  const isSectionPublishable = ({ hasChanges, published, visibilityState }) => {
    const sectionStatus = getItemStatus({
      published,
      visibilityState,
      hasChanges,
    });
    const isDisabled =
      (sectionStatus === ITEM_BADGE_STATUS.live ||
        sectionStatus === ITEM_BADGE_STATUS.publishedNotLive) &&
      !hasChanges;
    return !isDisabled;
  };

  const publishAllItems = async () => {
    const allItemIds = sectionsList
      .filter(({ hasChanges, published, visibilityState }) => {
        return isSectionPublishable({ hasChanges, published, visibilityState });
      })
      .map((section) => section.id);

    if (allItemIds.length === 0) {
      return;
    }

    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      // Cannot use Promise.all since backend seems to have a race condition on processing simultanous publish requests
      // TODO: Request backend to implement a batch publish API and use that instead
      for (const itemId of allItemIds) {
        await publishCourseSection(itemId);
      }

      const sectionIds = sectionsList.map((section) => section.id);
      dispatch(fetchCourseSectionQuery(sectionIds));

      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      setShowSuccessToast(true);
    } catch (error) {
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      setShowErrorToast(true);
    }
  };

  const handleConfirmPublish = async () => {
    await publishAllItems();
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const chips = useMemo(
    () => [courseDetails?.org, courseDetails?.number, getCourseRunFromCourseId(courseDetails?.id)],
    [courseDetails?.org, courseDetails?.number, courseDetails?.id],
  );

  const dueDate = courseDetails?.end ? formatToDate(courseDetails.end, 'MMM Do, YYYY') : undefined;

  // Prepare course data for the modal
  const courseData = useMemo(
    () => ({
      thumbnail: courseDetails?.media?.image?.raw,
      title: courseDetails?.name,
      tags: chips.filter(Boolean),
      startDate: courseDetails?.start
        ? formatToDate(courseDetails.start, 'MMM Do, YYYY')
        : undefined,
      endDate: courseDetails?.end ? formatToDate(courseDetails.end, 'MMM Do, YYYY') : undefined,
    }),
    [
      courseDetails?.media?.image?.raw,
      courseDetails?.name,
      courseDetails?.start,
      courseDetails?.end,
      chips,
    ],
  );

  // Disable when:
  // - Start date and end date are not set
  // - Course is being generated (to be implemented)
  const isDisabledPublishCourse = !courseDetails?.start || !courseDetails?.end;

  const shouldDisplayLiveChip = sectionsList.every(({ hasChanges, published, visibilityState }) => {
    return !isSectionPublishable({ hasChanges, published, visibilityState });
  });

  return (
    <div
      className={classNames(
        'tw-h-full tw-overflow-hidden tw-border-0 tw-border-l tw-border-solid tw-flex tw-flex-col tw-border-l-gray-200 tw-transition-all tw-duration-300 tw-ease-in-out',
        isSidebarOpen ? 'tw-w-56' : 'tw-w-8',
      )}
    >
      {/* Header Section */}
      <div
        className={classNames(
          'tw-py-6 tw-flex tw-flex-col tw-gap-3',
          isSidebarOpen ? 'tw-px-4' : 'tw-px-0 !tw-pl-2',
        )}
      >
        <div className="tw-flex tw-flex-row">
          <div className="tw-flex-1 tw-overflow-hidden">
            {courseDetails?.media?.image?.raw && (
              <img
                className={classNames(
                  'tw-w-24 tw-h-16 tw-rounded-[8px] tw-transition-all tw-duration-300 tw-ease-in-out',
                  isSidebarOpen ? 'tw-opacity-100 tw-scale-100' : 'tw-opacity-0 tw-scale-95',
                )}
                src={courseDetails?.media?.image?.raw}
                alt="Course Thumbnail"
              />
            )}
          </div>
          <button
            onClick={handleToggleSidebar}
            className="tw-size-6 tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-bg-transparent tw-border-none tw-p-0 hover:tw-bg-gray-100 tw-rounded"
            type="button"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <LayoutLeft className="tw-size-4 tw-text-gray-600" />
          </button>
        </div>
        <div
          className={classNames(
            'tw-flex tw-flex-col tw-gap-3 tw-transition-all tw-duration-300 tw-ease-in-out',
            isSidebarOpen
              ? 'tw-opacity-100 tw-max-h-96'
              : 'tw-opacity-0 tw-max-h-0 tw-overflow-hidden',
          )}
        >
          <div className="tw-flex tw-flex-col tw-gap-1">
            <div className="tw-flex tw-flex-row tw-gap-1">
              {chips.slice(0, 2).map((value) => {
                if (value) {
                  return (
                    <div
                      key={value}
                      className="tw-px-1.5 tw-py-0.5 tw-bg-white tw-rounded-[6px] tw-shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] tw-outline tw-outline-1 tw-outline-offset-[-1px] tw-outline-gray-300 tw-inline-flex tw-justify-start tw-items-center tw-w-fit tw-h-[22px]"
                    >
                      <div className="tw-text-center tw-justify-start tw-text-slate-700 tw-text-xs tw-font-medium tw-leading-none">
                        {value}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {chips[2] && (
              <div className="tw-flex tw-flex-row tw-gap-1">
                <div className="tw-px-1.5 tw-py-0.5 tw-bg-white tw-rounded-[6px] tw-shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] tw-outline tw-outline-1 tw-outline-offset-[-1px] tw-outline-gray-300 tw-inline-flex tw-justify-start tw-items-center tw-w-fit tw-h-[22px]">
                  <div className="tw-text-center tw-justify-start tw-text-slate-700 tw-text-xs tw-font-medium tw-leading-none">
                    {chips[2]}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="tw-flex tw-flex-col tw-gap-1">
            <div className="tw-self-stretch tw-justify-start tw-text-gray-900 tw-text-sm tw-font-semibold tw-leading-tight">
              {courseDetails?.name}
            </div>
            {dueDate && (
              <div className="tw-text-gray-500 tw-text-xs">
                {intl.formatMessage(courseOutlineMessages.dueDate, { dueDate })}
              </div>
            )}
          </div>
          {shouldDisplayLiveChip ? (
            <Badge variant="success" className="tw-w-fit">
              {intl.formatMessage(courseOutlineMessages.published)}
            </Badge>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={
                isDisabledPublishCourse ? (
                  <Tooltip id="publish-course-tooltip">
                    {intl.formatMessage(courseOutlineMessages.disabledPublishButtonTooltip)}
                  </Tooltip>
                ) : (
                  <div className="tw-size-0" />
                )
              }
            >
              <Button
                labels={{ default: intl.formatMessage(courseOutlineMessages.publishCourse) }}
                onClick={handlePublishCourse}
                iconBefore={RocketIcon}
                variant="secondary"
                className="tw-text-sm !tw-h-10 disabled:tw-bg-white disabled:tw-border-gray-200 disabled:tw-text-gray-400 disabled:tw-cursor-not-allowed active:disabled:!tw-bg-white"
                size="sm"
                disabled={isDisabledPublishCourse}
              />
            </OverlayTrigger>
          )}
        </div>
      </div>

      {/* Menu Items Section */}
      <div
        className={classNames(
          'tw-flex-1 tw-transition-all tw-duration-300 tw-ease-in-out',
          isSidebarOpen
            ? 'tw-opacity-100 tw-max-h-full tw-overflow-y-auto'
            : 'tw-opacity-0 tw-max-h-0 tw-overflow-hidden',
        )}
      >
        <div className="tw-px-4 tw-pb-6 tw-flex tw-flex-col tw-gap-1">
          {mainMenuDropdowns.map((menuItem) => (
            <MenuItem key={menuItem.id} menuItem={menuItem} />
          ))}
        </div>
      </div>

      {/* Publish Course Modal */}
      <PublishCourseModal
        isOpen={isPublishModalOpen}
        onClose={handleClosePublishModal}
        onPublish={handleConfirmPublish}
        courseData={courseData}
      />
      {/* Success Toast */}
      <Toast show={showSuccessToast} onClose={() => setShowSuccessToast(false)}>
        {intl.formatMessage(messages.publishCourseModalSuccessMessage)}
      </Toast>

      {/* Error Toast */}
      <Toast show={showErrorToast} onClose={() => setShowErrorToast(false)}>
        {intl.formatMessage(messages.publishCourseModalErrorMessage)}
      </Toast>
    </div>
  );
};

export default CourseSidebar;
