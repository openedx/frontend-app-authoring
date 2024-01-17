import { useSelector } from 'react-redux';
import { getUserPermissions, getUserPermissionsEnabled } from './data/selectors';

const useUserPermissions = () => {
  const userPermissionsEnabled = useSelector(getUserPermissionsEnabled);
  const userPermissions = useSelector(getUserPermissions);

  const checkPermission = (permission) => {
    if (!userPermissionsEnabled || !Array.isArray(userPermissions)) {
      return false;
    }
    return userPermissions.includes(permission);
  };

  return {
    checkPermission,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useUserPermissions };
