import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  getCourseModes, getCertificateActivationUrl, getCertificateWebViewUrl, getIsCertificateActive,
} from '../../../data/selectors';
import { updateCertificateActiveStatus } from '../../../data/thunks';

const useHeaderButtons = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const courseModes = useSelector(getCourseModes);
  const certificateWebViewUrl = useSelector(getCertificateWebViewUrl);
  const certificateActivationHandlerUrl = useSelector(getCertificateActivationUrl);
  const isCertificateActive = useSelector(getIsCertificateActive);

  const [dropdowmItem, setDropdowmItem] = useState(courseModes[0]);

  const handleActivationStatus = () => {
    const status = !isCertificateActive;

    dispatch(updateCertificateActiveStatus(courseId, certificateActivationHandlerUrl, status));
  };

  const previewUrl = useMemo(() => {
    if (!certificateWebViewUrl) { return ''; }

    const getUrl = () => new URL(certificateWebViewUrl, window.location.origin);
    const url = getUrl();

    const searchParams = new URLSearchParams(url.search);
    searchParams.set('preview', dropdowmItem);
    url.search = searchParams.toString();

    return url.toString();
  }, [certificateWebViewUrl, dropdowmItem]);

  return {
    previewUrl,
    courseModes,
    dropdowmItem,
    isCertificateActive,
    setDropdowmItem,
    handleActivationStatus,
  };
};

export default useHeaderButtons;
