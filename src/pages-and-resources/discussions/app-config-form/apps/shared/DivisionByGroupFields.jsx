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
    dividedDiscussionsIds,
    discussionTopics,
    divideByCohorts,
    divideCourseTopics,
  } = appConfig;

  useEffect(() => {
    dispatch(updateDividedDiscussionsIds({ dividedDiscussionsIds }));
  }, [dividedDiscussionsIds]);

  useEffect(() => {
    const discussionTopicIds = discussionTopics.map(
      (topic) => topic.id,
    );
    const divideCourseTopicsSwitchOff = (
      discussionTopicIds.length === dividedDiscussionsIds.length
      && discussionTopicIds.every((topicId) => dividedDiscussionsIds.includes(topicId))
    ) || !dividedDiscussionsIds.length;

    if (divideByCohorts) {
      if (divideCourseTopicsSwitchOff && !divideCourseTopics) {
        setFieldValue('divideCourseTopics', false);
        setFieldValue('dividedDiscussionsIds', discussionTopicIds);
      } else {
        setFieldValue('divideCourseTopics', true);
      }
    } else {
      setFieldValue('dividedDiscussionsIds', []);
      setFieldValue('divideCourseTopics', false);
    }

    const {
      dividedDiscussionsIds: courseDividedDiscussionsIds,
      discussionTopics: courseDiscussionTopics,
      ...payload
    } = appConfig;
    dispatch(updateModel({ modelType: 'appConfigs', model: payload }));
  }, [
    divideByCohorts,
    divideCourseTopics,
    discussionTopics,
  ]);

  const handleCheckBoxToggle = (event, push, remove) => {
    const { checked, value } = event.target;
    if (checked) {
      push(value);
    } else {
      remove(dividedDiscussionsIds.indexOf(value));
    }
  };

  const handleDivideCourseWideTopicsSwitch = (event) => {
    const { checked } = event.target;
    if (!checked) {
      setFieldValue('dividedDiscussionsIds', []);
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
              onChange={(event) => handleDivideCourseWideTopicsSwitch(event)}
              onBlur={onBlur}
              className="ml-4 mt-3"
              id="divideCourseTopics"
              checked={divideCourseTopics}
              label={intl.formatMessage(messages.divideCourseTopicsLabel)}
              helpText={intl.formatMessage(messages.divideCourseTopicsHelp)}
            />
            <TransitionReplace>
              {divideCourseTopics ? (
                <React.Fragment key="open">
                  <FieldArray
                    name="dividedDiscussionsIds"
                    render={({ push, remove }) => (
                      <Form.Group className="ml-4">
                        {discussionTopics.map((topic) => (
                          <Form.Check
                            key={`checkbox-${topic.id}`}
                            id={`checkbox-${topic.id}`}
                            value={topic.id}
                            onChange={(event) => handleCheckBoxToggle(event, push, remove)}
                            onBlur={onBlur}
                            checked={dividedDiscussionsIds.includes(
                              topic.id,
                            )}
                            label={topic.name}
                          />
                        ))}
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
    divideCourseTopics: PropTypes.bool,
    discussionTopics: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    })),
    dividedDiscussionsIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default injectIntl(DivisionByGroupFields);
