import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { RequestStatus } from './data/constants';
import { getCourseAppSettingValue, getLoadingStatus } from './pages-and-resources/data/selectors';
import { fetchCourseAppSettings, updateCourseAppSetting } from './pages-and-resources/data/thunks';
import { PagesAndResourcesContext } from './pages-and-resources/PagesAndResourcesProvider';

export const executeThunk = async (thunk, dispatch, getState) => {
  await thunk(dispatch, getState);
  await new Promise(setImmediate);
};

export function useIsMobile() {
  return useMediaQuery({ query: '(max-width: 767.98px)' });
}

export function useIsDesktop() {
  return useMediaQuery({ query: '(min-width: 992px)' });
}

export function useAppSetting(settingName) {
  const dispatch = useDispatch();
  const { courseId } = useContext(PagesAndResourcesContext);
  const settingValue = useSelector(getCourseAppSettingValue(settingName));
  const loadingStatus = useSelector(getLoadingStatus);
  useEffect(() => {
    if ([RequestStatus.DENIED, RequestStatus.FAILED].includes(loadingStatus)) {
      return;
    }
    if (settingValue === undefined || settingValue === null) {
      dispatch(fetchCourseAppSettings(courseId, [settingName]));
    }
  }, [courseId]);

  const saveSetting = (value) => dispatch(updateCourseAppSetting(courseId, settingName, value));
  return [settingValue, saveSetting];
}
