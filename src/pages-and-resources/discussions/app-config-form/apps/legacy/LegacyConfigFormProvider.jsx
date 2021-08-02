import React, { createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { updateValidationStatus } from '../../../data/slice';

export const LegacyConfigFormContext = createContext({});

export default function LegacyConfigFormProvider({ children, value }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateValidationStatus({ hasError: value.isFormInvalid }));
  }, [value.isFormInvalid]);

  return (
    <LegacyConfigFormContext.Provider value={value}>
      {children}
    </LegacyConfigFormContext.Provider>
  );
}

LegacyConfigFormProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.shape({
    discussionTopicErrors: PropTypes.arrayOf(PropTypes.bool),
    validDiscussionTopics: PropTypes.arrayOf(PropTypes.shape({
      validTopics: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.string,
      })),
      setValidDiscussionTopics: PropTypes.func,
    })),
    isFormInvalid: PropTypes.bool,
  }).isRequired,
};
