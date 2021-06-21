import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Add } from '@edx/paragon/icons';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from '../messages';
import TopicItem from './TopicItem';
import { updateValidationStatus } from '../../../../data/slice';

const DiscussionTopics = ({ intl }) => {
  const {
    values: appConfig,
    setFieldValue,
    errors,
    touched,
    validateForm,
  } = useFormikContext();
  const { discussionTopics, divideDiscussionIds } = appConfig;
  const [topics, setTopics] = useState(discussionTopics);
  const dispatch = useDispatch();

  const fieldErrors = topics.map((value, index) => Boolean(
    touched.discussionTopics
      && touched.discussionTopics[index]?.name
      && errors.discussionTopics
      && errors?.discussionTopics[index]?.name,
  ));

  const isFormInvalid = fieldErrors.some((error) => error === true);
  useEffect(() => {
    dispatch(updateValidationStatus({ hasError: isFormInvalid }));
  }, [isFormInvalid]);

  useEffect(() => {
    setTopics(discussionTopics);
  }, [discussionTopics]);

  const handleTopicDelete = async (topicIndex, topicId, remove) => {
    await remove(topicIndex);
    validateForm();
    const updatedDividedDiscussionsIds = divideDiscussionIds.filter(
      (id) => id !== topicId,
    );
    setFieldValue('divideDiscussionIds', updatedDividedDiscussionsIds);
  };

  const addNewTopic = (push) => {
    const payload = { name: '', id: uuid() };
    push(payload);
    setFieldValue('divideDiscussionIds', [...divideDiscussionIds, payload.id]);
  };

  return (
    <>
      <h5 className="text-gray-500 mt-4 mb-2">
        {intl.formatMessage(messages.discussionTopics)}
      </h5>
      <label className="text-primary-500 mb-2 h4">
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
              {topics.map((topic, index) => (
                <TopicItem
                  {...topic}
                  key={`topic-${topic.id}`}
                  index={index}
                  onDelete={() => handleTopicDelete(index, topic.id, remove)}
                  hasError={fieldErrors[index]}
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
