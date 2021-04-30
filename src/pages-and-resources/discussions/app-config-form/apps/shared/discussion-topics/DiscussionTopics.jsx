import { Collapsible, Form, Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import React, { useState } from 'react';
import messages from '../messages';
import TopicItem from './TopicItem';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

const newTopic = { id: 'unique-id', name: '' };
const dataTopics = [
  {
    id: 'id-general',
    name: 'General',
  },
  {
    id: 'id-intro',
    name: 'Introductoin',
  },
];

function DiscussionTopics({ intl }) {
  const [topics, setTopics] = useState(dataTopics);
  const handleAddNewTopic = () => {
    setTopics([...topics, newTopic]);
  };

  return (
    <>
      <h5 className="text-gray-500">
        {intl.formatMessage(messages.discussionTopics)}
      </h5>
      <h4>General discussion topics</h4>
      <div className="small mb-4">
        Discussions can include general topics not contained to the course
        structure. All courses have a general topic by default.
      </div>
      <div>
        {topics.map((topic) => (
          <TopicItem {...topic} key={`topic-${topic.id}`} />
        ))}
      </div>

      <div className="mb-3">
        <Add />
        <Button
          onClick={handleAddNewTopic}
          variant="link"
          size="inline"
          className="mr-1 text-primary-500"
        >
          Add topic
        </Button>
      </div>
    </>
  );
}

DiscussionTopics.propTypes = {};

export default injectIntl(DiscussionTopics);
