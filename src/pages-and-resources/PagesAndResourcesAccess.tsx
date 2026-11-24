import { Outlet } from 'react-router-dom';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getPagesAndResourcesPermissions } from '@src/authz/permissionHelpers';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';

const PagesAndResourcesAccess = () => {
  const { courseId } = useCourseAuthoringContext();
  const {
    isLoading,
    canViewPagesAndResources,
    canManagePagesAndResources,
  } = useCourseUserPermissions(courseId, getPagesAndResourcesPermissions(courseId));

  if (isLoading) {
    return null;
  }

  if (!canViewPagesAndResources && !canManagePagesAndResources) {
    return <PermissionDeniedAlert />;
  }

  return <Outlet />;
};

export default PagesAndResourcesAccess;
