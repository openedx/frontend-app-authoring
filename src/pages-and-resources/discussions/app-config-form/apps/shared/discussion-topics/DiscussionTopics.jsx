import React, { useContext, useCallback } from 'react';
import { Add } from '@openedx/paragon/icons';
import { Button } from '@openedx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import messages from '../../../messages';
import TopicItem from './TopicItem';
import { OpenedXConfigFormContext } from '../../openedx/OpenedXConfigFormProvider';
import { filterItemFromObject } from '../../../utils';

const DiscussionTopics = ({ intl }) => {
  const {
    values: appConfig,
    validateForm,
    setFieldValue,
  } = useFormikContext();
  const { discussionTopics, divideDiscussionIds } = appConfig;
  const {
    discussionTopicErrors,
    validDiscussionTopics,
    setValidDiscussionTopics,
  } = useContext(OpenedXConfigFormContext);

  const handleTopicDelete = async (topicIndex, topicId, remove) => {
    await remove(topicIndex);
    validateForm();
    setValidDiscussionTopics(filterItemFromObject(validDiscussionTopics, 'id', topicId));
  };

  const handleOnFocus = useCallback((id, hasError) => {
    if (hasError) {
      setValidDiscussionTopics(currentValidTopics => filterItemFromObject(currentValidTopics, 'id', id));
      setFieldValue('divideDiscussionIds', filterItemFromObject(divideDiscussionIds, 'id', id));
    } else {
      setValidDiscussionTopics(currentValidTopics => {
        const allDiscussionTopics = [...currentValidTopics, ...discussionTopics.filter(topic => topic.id === id)];
        const allValidTopics = _.remove(allDiscussionTopics, topic => topic.name !== '');
        return _.uniqBy(allValidTopics, 'id');
      });
      setFieldValue('divideDiscussionIds', _.uniq([...divideDiscussionIds, id]));
    }
  }, [divideDiscussionIds, discussionTopics]);

  const addNewTopic = (push) => {
    const payload = { name: '', id: uuid() };
    push(payload);
  };

  return (
    <>
      <h5 className="text-gray-500 mt-4 mb-2">
        {intl.formatMessage(messages.discussionTopics)}
      </h5>
      <label className="text-primary-500 mb-1 h4">
        {intl.formatMessage(messages.discussionTopicsLabel)}
      </label>
      <div className="small mb-4 text-muted">
        {intl.formatMessage(messages.discussionTopicsHelp)}
      </div>
      <div>
        <FieldArray
          name="discussionTopics"
          render={({ push, remove }) => (
            <div>
              {discussionTopics.map((topic, index) => (
                <TopicItem
                  {...topic}
                  key={`topic-${topic.id}`}
                  index={index}
                  onDelete={() => handleTopicDelete(index, topic.id, remove)}
                  onFocus={(hasError) => handleOnFocus(topic.id, hasError)}
                  hasError={discussionTopicErrors[index]}
                />
              ))}
              <div className="mb-4">
                <Button
                  onClick={() => addNewTopic(push)}
                  variant="link"
                  iconBefore={Add}
                  className="text-primary-500 p-0"
                >
                  {intl.formatMessage(messages.addTopicButton)}
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
