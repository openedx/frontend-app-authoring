/* eslint-disable import/named */
import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ModalDialog,
  ActionRow,
} from '@openedx/paragon';

import { courseOutlineQueryKeys, usePublishCourseItem } from '@src/course-outline/data/apiHooks';
import { XBlock } from '@src/data/types';
import LoadingButton from '@src/generic/loading-button';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useQueryClient } from '@tanstack/react-query';
import messages from './messages';
import { COURSE_BLOCK_NAMES } from '../constants';

const PublishModal = () => {
  const intl = useIntl();
  const { isPublishModalOpen, currentPublishModalData, closePublishModal } = useCourseAuthoringContext();
  const {
    id, displayName, childInfo, category,
  } = currentPublishModalData?.value || {};
  const categoryName = COURSE_BLOCK_NAMES[category || '']?.name.toLowerCase();
  const children: XBlock[] = childInfo?.children || [];
  const publishMutation = usePublishCourseItem();
  const queryClient = useQueryClient();

  const childrenIds = useMemo(() => children.reduce((
    result: string[],
    current: XBlock,
  ): string[] => {
    const grandChildren = current.childInfo?.children.filter((child) => child.hasChanges) || [];
    const temp = [...result, ...grandChildren.map((child) => child.id)];
    if (current.hasChanges) {
      temp.push(current.id);
    }
    return temp;
  }, []), [children]);

  const onPublishSubmit = async () => {
    if (id) {
      await publishMutation.mutateAsync(id, {
        onSettled: () => {
          closePublishModal();
          // Update query client to refresh the data of all children blocks
          childrenIds.forEach((blockId) => {
            queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(blockId) });
          });
          queryClient.invalidateQueries({
            queryKey: courseOutlineQueryKeys.courseItemId(currentPublishModalData?.sectionId),
          });
          queryClient.invalidateQueries({
            queryKey: courseOutlineQueryKeys.courseItemId(currentPublishModalData?.subsectionId),
          });
        },
      });
    }
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages.title, { title: displayName })}
      className="publish-modal"
      isOpen={isPublishModalOpen}
      onClose={closePublishModal}
      hasCloseButton
      isFullscreenOnMobile
      isOverflowVisible={false}
    >
      <ModalDialog.Header className="publish-modal__header">
        <ModalDialog.Title>
          {intl.formatMessage(messages.title, { title: displayName })}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <p className="small">
          {intl.formatMessage(messages.description, { category: categoryName })}
        </p>
        {children.filter(child => child.hasChanges).map((child) => {
          let grandChildren = child.childInfo?.children || [];
          grandChildren = grandChildren.filter(grandChild => grandChild.hasChanges);

          return grandChildren.length ? (
            <React.Fragment key={child.id}>
              <span className="small text-gray-400">{child.displayName}</span>
              {grandChildren.map((grandChild) => (
                <div
                  key={grandChild.id}
                  className="small border border-light-400 p-2 publish-modal__subsection"
                >
                  {grandChild.displayName}
                </div>
              ))}
            </React.Fragment>
          ) : (
            <div
              key={child.id}
              className="small border border-light-400 p-2 publish-modal__subsection"
            >
              {child.displayName}
            </div>
          );
        })}
      </ModalDialog.Body>
      <ModalDialog.Footer className="pt-1">
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            {intl.formatMessage(messages.cancelButton)}
          </ModalDialog.CloseButton>
          <LoadingButton
            data-testid="publish-confirm-button"
            onClick={onPublishSubmit}
            label={intl.formatMessage(messages.publishButton)}
          />

        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default PublishModal;
