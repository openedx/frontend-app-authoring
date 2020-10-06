import React, { useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import DiscussionToolSelector from './discussion-tool-selector/DiscussionToolSelector';

// XXX this is just for testing and should be removed ASAP
const forums = [
  {
    forumId: 'edX Forum',
    logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
    description: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
    supportLevel: 'Full support',
    isAvailable: true,
    features: ['LTI Integration', 'Discussion Page', 'Embedded Course Sections', 'Embedded Course Units', 'WCAG 2.1 Support'],
  },
  {
    forumId: 'Piazza',
    logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
    description: 'Piazza is designed to connect students, TAs, and professors so every student can get the help they need when they need it',
    supportLevel: 'Partial support',
    isAvailable: true,
    features: ['LTI Integration', 'Discussion Page', 'Embedded Course Sections', 'WCAG 2.1 Support'],
  },
  {
    forumId: 'Yellowdig',
    logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
    description: 'Yellowdig is the digital solution that impacts the entire student lifecycle and enables lifelong learning.',
    supportLevel: 'Coming soon',
    isAvailable: false,
    features: ['LTI Integration', 'Discussion Page', 'Embedded Course Sections', 'WCAG 2.1 Support'],
  },
  {
    forumId: 'Untitled Forum',
    logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
    description: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
    supportLevel: 'Full support',
    isAvailable: true,
    features: ['LTI Integration', 'Discussion Page', 'Embedded Course Sections', 'Embedded Course Units', 'WCAG 2.1 Support'],
  },
];

const featuresList = ['LTI Integration', 'Discussion Page', 'Embedded Course Sections', 'Embedded Course Units', 'WCAG 2.1 Support'];

function DiscussionToolSelectorContainer({ intl }) {
  const [selectedForumId, setSelectedForumId] = useState(null);

  const onSelectForum = (forumId) => {
    setSelectedForumId(forumId);
  };

  return (
    <DiscussionToolSelector
      intl={intl}
      forums={forums}
      featuresList={featuresList}
      onSelectForum={onSelectForum}
      selectedForumId={selectedForumId}
    />
  );
}

DiscussionToolSelectorContainer.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionToolSelectorContainer);
