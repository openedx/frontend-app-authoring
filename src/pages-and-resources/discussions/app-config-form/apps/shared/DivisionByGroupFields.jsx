import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, TransitionReplace } from '@edx/paragon';
import { FieldArray, useFormikContext } from 'formik';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from './messages';
import AppConfigFormDivider from './AppConfigFormDivider';
import { updateDividedDiscussionsIds } from '../../../data/slice';
import { updateModel } from '../../../../../generic/model-store';

function DivisionByGroupFields({
  onBlur, onChange, intl, appConfig,
}) {
  const dispatch = useDispatch();
  const { setFieldValue } = useFormikContext();
  const {
    divideDiscussionIds,
    discussionTopics,
    divideByCohorts,
    divideCourseTopicsByCohorts,
  } = appConfig;

  useEffect(() => {
    dispatch(updateDividedDiscussionsIds({ divideDiscussionIds }));
  }, [divideDiscussionIds]);

  useEffect(() => {
    const discussionTopicIds = discussionTopics.map(
      (topic) => topic.id,
    );
    const divideCourseTopicsByCohortsOff = (
      discussionTopicIds.length === divideDiscussionIds.length
      && discussionTopicIds.every((topicId) => divideDiscussionIds.includes(topicId))
    ) || !divideDiscussionIds.length;

    if (divideByCohorts) {
      if (divideCourseTopicsByCohortsOff && !divideCourseTopicsByCohorts) {
        setFieldValue('divideCourseTopicsByCohorts', false);
        setFieldValue('divideDiscussionIds', discussionTopicIds);
      } else {
        setFieldValue('divideCourseTopicsByCohorts', true);
      }
    } else {
      setFieldValue('divideDiscussionIds', []);
      setFieldValue('divideCourseTopicsByCohorts', false);
    }

    const {
      divideDiscussionIds: courseDividedDiscussionsIds,
      discussionTopics: courseDiscussionTopics,
      ...payload
    } = appConfig;
    dispatch(updateModel({ modelType: 'appConfigs', model: payload }));
  }, [
    divideByCohorts,
    divideCourseTopicsByCohorts,
    discussionTopics,
  ]);

  const handleCheckBoxToggle = (event, push, remove) => {
    const { checked, value } = event.target;
    if (checked) {
      push(value);
    } else {
      remove(divideDiscussionIds.indexOf(value));
    }
  };

  const handleDivideCourseTopicsByCohortsToggle = (event) => {
    const { checked } = event.target;
    if (!checked) {
      setFieldValue('divideDiscussionIds', []);
    }
    onChange(event);
  };

  return (
    <>
      <h5 className="text-gray-500 mb-2 mt-4">
        {intl.formatMessage(messages.divisionByGroup)}
      </h5>
      <FormSwitchGroup
        onChange={onChange}
        className="mt-2"
        onBlur={onBlur}
        id="divideByCohorts"
        checked={divideByCohorts}
        label={intl.formatMessage(messages.divideByCohortsLabel)}
        helpText={intl.formatMessage(messages.divideByCohortsHelp)}
      />
      <TransitionReplace>
        {divideByCohorts ? (
          <React.Fragment key="open">
            <AppConfigFormDivider />
            <FormSwitchGroup
              onChange={(event) => handleDivideCourseTopicsByCohortsToggle(event)}
              onBlur={onBlur}
              className="ml-4 mt-3"
              id="divideCourseTopicsByCohorts"
              checked={divideCourseTopicsByCohorts}
              label={intl.formatMessage(messages.divideCourseTopicsByCohortsLabel)}
              helpText={intl.formatMessage(messages.divideCourseTopicsByCohortsHelp)}
            />
            <TransitionReplace>
              {divideCourseTopicsByCohorts ? (
                <React.Fragment key="open">
                  <FieldArray
                    name="divideDiscussionIds"
                    render={({ push, remove }) => (
                      <Form.Group className="ml-4">
                        <Form.CheckboxSet
                          onChange={(event) => handleCheckBoxToggle(event, push, remove)}
                          onBlur={onBlur}
                          defaultValue={divideDiscussionIds}
                        >
                          {discussionTopics.map((topic) => (
                            topic.name ? (
                              <Form.Checkbox
                                key={`checkbox-${topic.id}`}
                                id={`checkbox-${topic.id}`}
                                value={topic.id}
                              >
                                {topic.name}
                              </Form.Checkbox>
                            ) : null
                          ))}
                        </Form.CheckboxSet>
                      </Form.Group>
                    )}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment key="closed" />
              )}
            </TransitionReplace>
          </React.Fragment>
        ) : (
          <React.Fragment key="closed" />
        )}
      </TransitionReplace>
    </>
  );
}

DivisionByGroupFields.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool,
    divideCourseTopicsByCohorts: PropTypes.bool,
    discussionTopics: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    })),
    divideDiscussionIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default injectIntl(DivisionByGroupFields);
