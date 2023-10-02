import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { RequestStatus } from '../../data/constants';
import { getStudioHomeData } from '../../studio-home/data/selectors';
import {
  getRedirectUrlObj,
  getOrganizations,
  getPostErrors,
  getSavingStatus,
} from '../data/selectors';
import { updateSavingStatus, updatePostErrors } from '../data/slice';
import { fetchOrganizationsQuery } from '../data/thunks';
import messages from './messages';

const useCreateOrRerunCourse = (initialValues) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const redirectUrlObj = useSelector(getRedirectUrlObj);
  const createOrRerunCourseSavingStatus = useSelector(getSavingStatus);
  const allOrganizations = useSelector(getOrganizations);
  const postErrors = useSelector(getPostErrors);
  const {
    allowToCreateNewOrg,
    allowedOrganizations,
  } = useSelector(getStudioHomeData);
  const [isFormFilled, setFormFilled] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const organizations = allowToCreateNewOrg ? allOrganizations : allowedOrganizations;
  const specialCharsRule = /^[a-zA-Z0-9_\-.'*~\s]+$/;
  const noSpaceRule = /^\S*$/;
  const validationSchema = Yup.object().shape({
    displayName: Yup.string().required(
      intl.formatMessage(messages.requiredFieldError),
    ),
    org: Yup.string()
      .required(intl.formatMessage(messages.requiredFieldError))
      .matches(
        specialCharsRule,
        intl.formatMessage(messages.disallowedCharsError),
      )
      .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
    number: Yup.string()
      .required(intl.formatMessage(messages.requiredFieldError))
      .matches(
        specialCharsRule,
        intl.formatMessage(messages.disallowedCharsError),
      )
      .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
    run: Yup.string()
      .required(intl.formatMessage(messages.requiredFieldError))
      .matches(
        specialCharsRule,
        intl.formatMessage(messages.disallowedCharsError),
      )
      .matches(noSpaceRule, intl.formatMessage(messages.noSpaceError)),
  });

  const {
    values, errors, touched, handleChange, handleBlur, setFieldValue,
  } = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnBlur: false,
    validationSchema,
  });

  useEffect(() => {
    if (allowToCreateNewOrg) {
      dispatch(fetchOrganizationsQuery());
    }
  }, []);

  useEffect(() => {
    setFormFilled(Object.values(values).every((i) => i));
    dispatch(updatePostErrors({}));
  }, [values]);

  useEffect(() => {
    setShowErrorBanner(!!postErrors.errMsg);
  }, [postErrors]);

  useEffect(() => {
    if (createOrRerunCourseSavingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus({ status: '' }));
      const { url, destinationCourseKey } = redirectUrlObj;
      // New courses' url to the outline page is provided in the url. However, for course
      // re-runs the url is /course/. The actual destination for the rer-run's  outline
      // is in the destionationCourseKey attribute from the api.
      if (url) {
        if (destinationCourseKey) {
          window.location.assign(`${getConfig().STUDIO_BASE_URL}${url}${destinationCourseKey}`);
        } else {
          window.location.assign(`${getConfig().STUDIO_BASE_URL}${url}`);
        }
      }
    } else if (createOrRerunCourseSavingStatus === RequestStatus.FAILED) {
      dispatch(updateSavingStatus({ status: '' }));
    }
  }, [createOrRerunCourseSavingStatus]);

  const hasErrorField = (fieldName) => !!errors[fieldName] && !!touched[fieldName];
  const isFormInvalid = Object.keys(errors).length;

  return {
    intl,
    errors,
    values,
    postErrors,
    isFormFilled,
    isFormInvalid,
    organizations,
    showErrorBanner,
    dispatch,
    handleBlur,
    handleChange,
    hasErrorField,
    setFieldValue,
    setShowErrorBanner,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCreateOrRerunCourse };
