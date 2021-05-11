import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Add } from '@edx/paragon/icons';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from '../messages';
import TopicItem from './TopicItem';
import { removeModel } from '../../../../../../generic/model-store';
import { updateDiscussionTopicIds } from '../../../../data/slice';
import { updatedDiscussionTopics } from '../../../../data/thunks';

const DiscussionTopics = ({ intl }) => {
  const dispatch = useDispatch();
  const { values } = useFormikContext();
  const [topics, setTopics] = useState(values.discussionTopics);

  useEffect(() => {
    const updatedDiscussionTopicIds = values.discussionTopics?.map(topic => topic.id);

    setTopics(values.discussionTopics);
    dispatch(updateDiscussionTopicIds(updatedDiscussionTopicIds));
    dispatch(updatedDiscussionTopics(values));
  }, [values.discussionTopics]);

  const handleTopicDelete = (topicIndex, topicId, remove) => {
    remove(topicIndex);
    dispatch(removeModel({ modelType: 'discussionTopics', id: topicId }));
  };

  const addNewtopic = (push) => {
    const payload = { name: '', id: uuid() };
    push(payload);
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
        <FieldArray
          name="discussionTopics"
          render={({ push, remove }) => (
            <div>
              {
                topics.map((topic, index) => (
                  <TopicItem
                    {...topic}
                    key={`topic-${topic.id}`}
                    index={index}
                    onDelete={() => handleTopicDelete(index, topic.id, remove)}
                  />
                ))

              }
              <div className="mb-3">
                <Add />
                <Button
                  onClick={() => addNewtopic(push)}
                  variant="link"
                  size="inline"
                  className="mr-1 text-primary-500"
                >
                  Add topic
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
};

DiscussionTopics.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionTopics);
