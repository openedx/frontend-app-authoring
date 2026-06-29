import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import getPageHeadTitle from '@src/generic/utils';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { MODE_STATES } from '../data/constants';

import messages from '../messages';
import { useCertificates } from '../data/apiHooks';
import { useCertificatesContext } from '../context';

export const useCertificatesData = () => {
  const { courseId } = useCourseAuthoringContext();
  const {
    componentMode,
    setComponentMode,
  } = useCertificatesContext();
  const intl = useIntl();

  const {
    data: certificatesData,
    isPending: isLoading,
    failureReason: certificatesDataError,
  } = useCertificates(courseId);

  const {
    certificates,
    hasCertificateModes,
    courseTitle,
  } = certificatesData ?? {};

  const pageHeadTitle = getPageHeadTitle(courseTitle ?? '', intl.formatMessage(messages.headingTitleTabText));

  useEffect(() => {
    if (!hasCertificateModes) {
      setComponentMode(MODE_STATES.noModes);
    } else if (certificates?.length === 0) {
      setComponentMode(MODE_STATES.noCertificates);
    } else {
      setComponentMode(MODE_STATES.view);
    }
  }, [hasCertificateModes, certificates]);

  return {
    componentMode,
    isLoading,
    isDenied: certificatesDataError?.response?.status === 403,
    certificates,
    pageHeadTitle,
    hasCertificateModes,
  };
};
