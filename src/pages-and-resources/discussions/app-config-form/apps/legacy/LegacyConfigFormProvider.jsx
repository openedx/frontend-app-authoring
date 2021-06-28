import React, { createContext } from 'react';
import PropTypes from 'prop-types';

export const LegacyConfigFormContext = createContext({});

export default function LegacyConfigFormProvider({ children, value }) {
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
  }).isRequired,
};
