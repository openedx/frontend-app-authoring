import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, TransitionReplace } from '@edx/paragon';
import { FieldArray, useFormikContext } from 'formik';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from './messages';
import AppConfigFormDivider from './AppConfigFormDivider';
import { updateDividedCourseWideDiscussionsIds } from '../../../data/slice';
import { updateAppConfigs } from '../../../data/thunks';

function DivisionByGroupFields({
  onBlur, onChange, intl, values,
}) {
  const dispatch = useDispatch();
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    dispatch(updateDividedCourseWideDiscussionsIds(values.dividedCourseWideDiscussionsIds));
  }, [values.dividedCourseWideDiscussionsIds]);

  useEffect(() => {
    const discussionTopicIds = values.discussionTopics?.map(
      (topic) => topic.id
    );
    const divideCourseWideTopicsSwitchOff = (
      discussionTopicIds.length === values.dividedCourseWideDiscussionsIds?.length
      && discussionTopicIds.every((topicId) => values.dividedCourseWideDiscussionsIds?.includes(topicId))
    ) || !values.dividedCourseWideDiscussionsIds?.length;

    if (values.divideByCohorts) {
      if (divideCourseWideTopicsSwitchOff && !values.divideCourseWideTopics) {
        setFieldValue('divideCourseWideTopics', false);
        setFieldValue('dividedCourseWideDiscussionsIds', discussionTopicIds);
      } else {
        setFieldValue('divideCourseWideTopics', true);
      }
    } else {
      setFieldValue('dividedCourseWideDiscussionsIds', []);
      setFieldValue('divideCourseWideTopics', false);
    }

    const { dividedCourseWideDiscussionsIds, discussionTopics, ...payload } = values;
    dispatch(updateAppConfigs(payload));
  }, [
    values.divideByCohorts,
    values.divideCourseWideTopics,
    values.discussionTopics,
  ]);

  const handleCheckBoxToggle = (event, push, remove) => {
    if (event.target.checked) {
      push(event.target.value);
    } else {
      const index = values.dividedCourseWideDiscussionsIds?.indexOf(event.target.value);
      remove(index);
    }
  };

  const handleDivideCourseWideTopicsSwitch = (event) => {
    if (!event.target.checked) {
      setFieldValue('dividedCourseWideDiscussionsIds', []);
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
        checked={values.divideByCohorts}
        label={intl.formatMessage(messages.divideByCohortsLabel)}
        helpText={intl.formatMessage(messages.divideByCohortsHelp)}
      />
      <TransitionReplace>
        {values.divideByCohorts ? (
          <React.Fragment key="open">
            <AppConfigFormDivider />
            <FormSwitchGroup
              onChange={(event) => handleDivideCourseWideTopicsSwitch(event)}
              onBlur={onBlur}
              className="ml-4 mt-3"
              id="divideCourseWideTopics"
              checked={values.divideCourseWideTopics}
              label={intl.formatMessage(messages.divideCourseWideTopicsLabel)}
              helpText={intl.formatMessage(messages.divideCourseWideTopicsHelp)}
            />
            <TransitionReplace>
              {values.divideCourseWideTopics ? (
                <React.Fragment key="open">
                  <FieldArray
                    name="dividedCourseWideDiscussionsIds"
                    render={({ push, remove }) => (
                      <Form.Group className="ml-4">
                        {values.discussionTopics?.map((topic) => (
                          <Form.Check
                            key={`checkbox-${topic.id}`}
                            id={`checkbox-${topic.id}`}
                            value={topic.id}
                            onChange={(event) => handleCheckBoxToggle(event, push, remove)}
                            onBlur={onBlur}
                            checked={values.dividedCourseWideDiscussionsIds?.includes(
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
  values: PropTypes.shape({
    divideByCohorts: PropTypes.bool,
    divideCourseWideTopics: PropTypes.bool,
    discussionTopics: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    })),
    dividedCourseWideDiscussionsIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default injectIntl(DivisionByGroupFields);
