import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { MODE_STATES } from '../../data/constants';
import {
  getCourseTitle, getCourseNumber, getCourseNumberOverride, getCertificates,
} from '../../data/selectors';
import { updateCourseCertificate } from '../../data/thunks';
import { setMode } from '../../data/slice';
import { defaultCertificate } from '../../constants';

const useCertificatesList = (courseId) => {
  const dispatch = useDispatch();
  const certificates = useSelector(getCertificates);
  const courseTitle = useSelector(getCourseTitle);
  const courseNumber = useSelector(getCourseNumber);
  const courseNumberOverride = useSelector(getCourseNumberOverride);

  const [editModes, setEditModes] = useState({});

  const initialValues = certificates.map((certificate) => ({
    ...certificate,
    courseTitle: certificate.courseTitle || defaultCertificate.courseTitle,
    signatories: certificate.signatories || defaultCertificate.signatories,
  }));

  const handleSubmit = async (values) => {
    await dispatch(updateCourseCertificate(courseId, values));
    setEditModes({});
    dispatch(setMode(MODE_STATES.view));
  };

  return {
    editModes,
    courseTitle,
    certificates,
    courseNumber,
    initialValues,
    courseNumberOverride,
    setEditModes,
    handleSubmit,
  };
};

export default useCertificatesList;
