import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { Divider } from '../../../../generic/divider';
import { getCanEdit, getCourseSectionVertical, getCourseUnitData } from '../../../data/selectors';
import { useClipboard } from '../../../../generic/clipboard';
import { getCourseUserRole } from '../../../../course-team/data/api';
import messages from '../../messages';
import CourseUnitPublishButtonSlot from '../../../../plugin-slots/CourseUnitPublishButtonSlot';

interface ActionButtonsProps {
  openDiscardModal: () => void,
  handlePublishing: () => void,
}

type CourseRole = 'staff' | 'instructor' | null;

const extractCourseKeyFromOutlineUrl = (outlineUrl?: string): string | null => {
  if (!outlineUrl) {
    return null;
  }
  const match = outlineUrl.match(/\/course\/([^?]+)/);
  return match?.[1] ?? null;
};

const ActionButtons = ({
  openDiscardModal,
  handlePublishing,
}: ActionButtonsProps) => {
  const intl = useIntl();
  const {
    id,
    published,
    hasChanges,
    enableCopyPasteUnits,
  } = useSelector(getCourseUnitData);
  const courseSectionVertical = useSelector(getCourseSectionVertical);
  const canEdit = useSelector(getCanEdit);
  const { copyToClipboard } = useClipboard();

  const [courseRole, setCourseRole] = useState<CourseRole>(null);

  const courseKey = useMemo(
    () => extractCourseKeyFromOutlineUrl(courseSectionVertical?.outlineUrl),
    [courseSectionVertical?.outlineUrl],
  );

  useEffect(() => {
    // Only needed when the Publish button will render.
    if (!(!published || hasChanges)) {
      return;
    }

    if (!courseKey) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { role } = await getCourseUserRole(courseKey) as any;
        setCourseRole(role);
        if (cancelled) return;
      } catch (error: any) {
        if (cancelled) return;
        setCourseRole(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseKey, hasChanges, published]);

  const publishButtonText = courseRole
    ? intl.formatMessage(messages.actionButtonPublishTitle, { role: courseRole })
    : 'Publish';

  return (
    <>
      <CourseUnitPublishButtonSlot
        courseRole={courseRole}
        published={published}
        hasChanges={hasChanges}
        publishButtonText={publishButtonText}
        onPublish={handlePublishing}
      />
      {(published && hasChanges) && (
        <Button
          size="sm"
          variant="link"
          onClick={openDiscardModal}
          className="course-unit-sidebar-footer__discard-changes__btn mt-2"
        >
          {intl.formatMessage(messages.actionButtonDiscardChangesTitle)}
        </Button>
      )}
      {enableCopyPasteUnits && canEdit && (
        <>
          <Divider className="course-unit-sidebar-footer__divider" />
          <Button
            onClick={() => copyToClipboard(id)}
            variant="outline-primary"
            size="sm"
          >
            {intl.formatMessage(messages.actionButtonCopyUnitTitle)}
          </Button>
        </>
      )}
    </>
  );
};

export default ActionButtons;
