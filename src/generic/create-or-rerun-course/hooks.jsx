import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import { REGEX_RULES } from '../../constants';
import { RequestStatus, MAX_TOTAL_LENGTH, TOTAL_LENGTH_KEY } from '../../data/constants';
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
  const navigate = useNavigate();
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

  const { specialCharsRule, noSpaceRule } = REGEX_RULES;
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
  }).test(TOTAL_LENGTH_KEY, intl.formatMessage(messages.totalLengthError), function validateTotalLength() {
    const { org, number, run } = this?.options.originalValue || {};
    if ((org?.length || 0) + (number?.length || 0) + (run?.length || 0) > MAX_TOTAL_LENGTH) {
      return this.createError({ path: TOTAL_LENGTH_KEY, message: intl.formatMessage(messages.totalLengthError) });
    }
    return true;
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
    setFormFilled(
      Object.entries(values)
        ?.filter(([key]) => key !== 'undefined')
        .every(([, value]) => value),
    );
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
          navigate(`${url}${destinationCourseKey}`);
        } else {
          navigate(url);
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

export { useCreateOrRerunCourse };
