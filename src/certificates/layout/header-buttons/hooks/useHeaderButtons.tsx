import { useState, useMemo } from 'react';

import { useCertificates } from '@src/certificates/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCertificatesContext } from '@src/certificates/context';

const useHeaderButtons = () => {
  const { courseId } = useCourseAuthoringContext();

  const {
    data: certificatesData,
  } = useCertificates(courseId);
  const { activationStatusMutation } = useCertificatesContext();

  const {
    courseModes = [],
    certificateWebViewUrl,
    certificateActivationHandlerUrl,
    isActive: isCertificateActive,
  } = certificatesData ?? {};

  const [selectedMode, setSelectedMode] = useState<string | undefined>(undefined);
  const dropdowmItem = selectedMode ?? courseModes[0];

  const handleActivationStatus = () => {
    const status = !isCertificateActive;

    // oxlint-disable-next-line typescript/no-floating-promises
    activationStatusMutation.mutateAsync({
      path: certificateActivationHandlerUrl ?? '',
      activationStatus: status,
    });
  };

  const previewUrl = useMemo(() => {
    if (!certificateWebViewUrl) { return ''; }

    const getUrl = () => new URL(certificateWebViewUrl, window.location.origin);
    const url = getUrl();

    if (dropdowmItem) {
      const searchParams = new URLSearchParams(url.search);
      searchParams.set('preview', dropdowmItem);
      url.search = searchParams.toString();
    }
    return url.toString();
  }, [certificateWebViewUrl, dropdowmItem]);

  return {
    previewUrl,
    courseModes,
    dropdowmItem,
    isCertificateActive,
    setDropdowmItem: setSelectedMode,
    handleActivationStatus,
  };
};

export default useHeaderButtons;
