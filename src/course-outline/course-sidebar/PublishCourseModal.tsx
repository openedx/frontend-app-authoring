import { useIntl } from '@edx/frontend-platform/i18n';
import { ModalDialog } from '@openedx/paragon';
import React, { useState } from 'react';

import { ArrowRight, Loading01, XClose } from '@untitledui/icons';
import Button from 'shared/Components/Common/Button';
import messages from './messages';
import './modal.scss';

interface PublishCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => Promise<void>;
  courseData?: {
    thumbnail?: string;
    title?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
  };
}

const LoadingIcon = () => <Loading01 className="tw-animate-spin" />;

const PublishCourseModal: React.FC<PublishCourseModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  courseData = {},
}) => {
  const intl = useIntl();

  const { thumbnail, title, tags = [], startDate, endDate } = courseData;
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    onPublish()
      .then(() => {
        onClose();
      })
      .catch(() => {})
      .finally(() => {
        setIsPublishing(false);
      });
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      variant="default"
      hasCloseButton={false}
      isFullscreenOnMobile
      isOverflowVisible={false}
      className="tw-p-0 tw-w-[600px] tw-rounded-[16px] !tw-max-w-[600px]"
    >
      <div className="tw-bg-white tw-size-full">
        <div className="tw-content-stretch tw-flex tw-flex-col tw-items-start tw-justify-start tw-overflow-clip tw-relative tw-size-full">
          {/* Modal Header */}
          <div className="tw-bg-white tw-box-border tw-content-stretch tw-flex tw-flex-col tw-gap-[4px] tw-items-start tw-justify-center tw-pb-[16px] tw-pt-[32px] tw-px-[24px] tw-relative tw-shrink-0 tw-w-full">
            <span className="tw-text-2xl tw-text-gray-900 tw-font-semibold">
              {intl.formatMessage(messages.publishCourseModalTitle)}
            </span>
            <div className="tw-absolute tw-top-4 tw-right-4">
              <button
                onClick={onClose}
                disabled={isPublishing}
                className="tw-text-gray-600 tw-size-8 tw-flex tw-items-center tw-justify-center tw-border-0 tw-bg-transparent disabled:tw-text-gray-500 disabled:tw-pointer-events-none"
                type="button"
                aria-label="Close modal"
              >
                <XClose className="tw-size-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="tw-bg-white tw-box-border tw-content-stretch tw-flex tw-flex-col tw-gap-[24px] tw-items-center tw-justify-center tw-pb-[24px] tw-pt-[16px] tw-px-[24px] tw-relative tw-shrink-0 tw-w-full">
            {/* Description */}
            <span className="tw-text-sm tw-text-gray-600">
              {intl.formatMessage(messages.publishCourseModalDescription)}
            </span>

            {/* Course Thumbnail */}
            <img
              src={thumbnail}
              alt="Course Thumbnail"
              className="tw-w-[160px] tw-h-[107px] tw-object-cover tw-rounded-[8px] tw-outline-[8px] tw-outline-[rgba(135,91,247,0.2)]"
              style={{ outlineStyle: 'solid' }}
            />

            {/* Course Title and Tags */}
            <div className="tw-content-stretch tw-flex tw-flex-col tw-gap-[8px] tw-items-center tw-justify-center tw-relative tw-shrink-0 tw-w-full">
              <span className="tw-text-lg tw-text-gray-900 tw-font-bold">{title}</span>
              <div className="tw-content-stretch tw-flex tw-gap-[4px] tw-items-start tw-justify-start tw-relative tw-shrink-0">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="tw-px-1.5 tw-py-0.5 tw-bg-white tw-rounded-[6px] tw-shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] tw-outline tw-outline-1 tw-outline-offset-[-1px] tw-outline-gray-300 tw-inline-flex tw-justify-start tw-items-center tw-w-fit tw-h-[22px]"
                  >
                    <div className="tw-text-center tw-justify-start tw-text-slate-700 tw-text-xs tw-font-medium tw-leading-none">
                      {tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            {startDate && endDate && (
              <div className="tw-flex tw-gap-2 tw-items-center">
                <span className="tw-text-md tw-text-gray-600 tw-font-medium">{startDate}</span>
                <ArrowRight className="tw-text-gray-500 tw-size-3" />
                <span className="tw-text-md tw-text-gray-600 tw-font-medium">{endDate}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="tw-bg-gray-50 tw-box-border tw-content-stretch tw-flex tw-gap-[12px] tw-items-center tw-justify-end tw-p-[24px] tw-relative tw-shrink-0 tw-w-full">
            <Button
              labels={{ default: intl.formatMessage(messages.publishCourseModalButtonBack) }}
              onClick={onClose}
              variant="secondary"
              size="sm"
              disabled={isPublishing}
              className="tw-border-gray-300 tw-text-gray-700 hover:!tw-bg-gray-50 hover:!tw-text-gray-800 hover:!tw-border-gray-300 active:!tw-bg-gray-50 active:!tw-text-gray-800 active:!tw-border-gray-300 disabled:tw-pointer-events-none"
            />
            <Button
              labels={{
                default: intl.formatMessage(
                  isPublishing
                    ? messages.publishCourseModalButtonPublishing
                    : messages.publishCourseModalButtonPublish,
                ),
              }}
              onClick={handlePublish}
              variant="brand"
              size="sm"
              disabled={isPublishing}
              className="disabled:tw-pointer-events-none disabled:!tw-bg-gray-300"
              {...(isPublishing && { iconBefore: LoadingIcon })}
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="tw-absolute tw-border tw-border-[#e4e7ec] tw-border-solid tw-inset-0 tw-pointer-events-none tw-rounded-[16px] tw-shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]"
        />
      </div>
    </ModalDialog>
  );
};

export default PublishCourseModal;
