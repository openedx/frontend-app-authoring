import { useSelector } from 'react-redux';
import { getUserPermissions, getUserPermissionsEnabled } from './data/selectors';

const useUserPermissions = () => {
  const userPermissionsEnabled = useSelector(getUserPermissionsEnabled);
  const userPermissions = useSelector(getUserPermissions);

  const hasPermissions = (checkPermissions) => {
    if (!userPermissionsEnabled || !Array.isArray(userPermissions)) {
      return false;
    }
    return userPermissions.includes(checkPermissions);
  };

  return {
    hasPermissions,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useUserPermissions };
