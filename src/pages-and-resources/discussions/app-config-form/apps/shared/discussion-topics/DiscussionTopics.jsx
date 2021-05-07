import React, { useState, useEffect } from 'react';
import { Add } from '@edx/paragon/icons';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from '../messages';
import TopicItem from './TopicItem';

const DiscussionTopics = ({ intl }) => {
  const { values } = useFormikContext();
  const [topics, setTopics] = useState(values.discussionTopics);

  useEffect(() => {
    setTopics(values.discussionTopics);
  }, [values]);

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
                    onDelete={(topicIndex) => remove(topicIndex)}
                  />
                ))

              }
              <div className="mb-3">
                <Add />
                <Button
                  onClick={() => push({ id: uuid(), name: '' })}
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
