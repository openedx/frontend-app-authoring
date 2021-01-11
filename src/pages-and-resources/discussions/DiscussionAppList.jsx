import React, { useState } from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Container, Row } from '@edx/paragon';
import messages from './messages';
import DiscussionAppCard from './DiscussionAppCard';
import FeaturesTable from './FeaturesTable';

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

function DiscussionAppList({ intl }) {
  const [selectedForumId, setSelectedForumId] = useState(null);

  const onSelectForum = (forumId) => {
    if (selectedForumId === forumId) {
      setSelectedForumId(null);
    } else {
      setSelectedForumId(forumId);
    }
  };

  return (
    <Container fluid className="text-info-500">
      <h6 className="my-4 text-center">{intl.formatMessage(messages.heading)}</h6>

      <Row>
        {forums.map(forum => (
          <DiscussionAppCard
            key={forum.forumId}
            forum={forum}
            selected={forum.forumId === selectedForumId}
            onSelect={onSelectForum}
          />
        ))}
      </Row>

      <div className="d-flex justify-content-between align-items-center">
        <h2 className="my-3">
          {intl.formatMessage(messages.supportedFeatures)}
        </h2>
        {selectedForumId && (
          <Button variant="primary">
            {intl.formatMessage(messages.configureTool, { toolName: selectedForumId })}
          </Button>
        )}
      </div>

      <FeaturesTable forums={forums} featuresList={featuresList} />
    </Container>
  );
}

DiscussionAppList.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionAppList);
