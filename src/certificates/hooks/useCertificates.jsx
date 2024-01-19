import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../../data/constants';
import getPageHeadTitle from '../../generic/utils';
import {
  getComponentMode, getLoadingStatus, getCertificates, getHasCertificateModes, getCourseTitle,
} from '../data/selectors';
import { setMode } from '../data/slice';
import { fetchCertificates } from '../data/thunks';
import { MODE_STATES } from '../data/constants';

import messages from '../messages';

const useCertificates = ({ courseId }) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const componentMode = useSelector(getComponentMode);
  const certificates = useSelector(getCertificates);
  const loadingStatus = useSelector(getLoadingStatus);
  const hasCertificateModes = useSelector(getHasCertificateModes);
  const courseTitle = useSelector(getCourseTitle);

  const isLoading = useMemo(() => loadingStatus === RequestStatus.IN_PROGRESS, [loadingStatus]);

  const pageHeadTitle = getPageHeadTitle(courseTitle, intl.formatMessage(messages.headingTitleTabText));

  useEffect(() => {
    if (!hasCertificateModes) {
      dispatch(setMode(MODE_STATES.noModes));
    } else if (certificates.length === 0) {
      dispatch(setMode(MODE_STATES.noCertificates));
    } else {
      dispatch(setMode(MODE_STATES.view));
    }
  }, [hasCertificateModes, certificates]);

  useEffect(() => {
    dispatch(fetchCertificates(courseId));
  }, [courseId]);

  return {
    componentMode, isLoading, loadingStatus, certificates, pageHeadTitle, hasCertificateModes,
  };
};

export default useCertificates;
