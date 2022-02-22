import React, { useEffect, useContext } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, TransitionReplace } from '@edx/paragon';
import { FieldArray, useFormikContext } from 'formik';
import _ from 'lodash';
import FormSwitchGroup from '../../../../../generic/FormSwitchGroup';
import messages from '../../messages';
import AppConfigFormDivider from './AppConfigFormDivider';
import { OpenedXConfigFormContext } from '../openedx/OpenedXConfigFormProvider';

const DivisionByGroupFields = ({ intl }) => {
  const { validDiscussionTopics } = useContext(OpenedXConfigFormContext);
  const {
    handleChange,
    handleBlur,
    values: appConfig,
    setFieldValue,
  } = useFormikContext();
  const {
    divideDiscussionIds,
    discussionTopics,
    divideByCohorts,
    divideCourseTopicsByCohorts,
  } = appConfig;

  useEffect(() => {
    if (divideByCohorts) {
      if (!divideCourseTopicsByCohorts && _.size(discussionTopics) !== _.size(divideDiscussionIds)) {
        setFieldValue('divideDiscussionIds', discussionTopics.map(topic => topic.id));
      }
    } else {
      setFieldValue('divideDiscussionIds', []);
      setFieldValue('divideCourseTopicsByCohorts', false);
    }
  }, [
    divideByCohorts,
    divideCourseTopicsByCohorts,
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
    handleChange(event);
  };

  return (
    <>
      <h5 className="text-gray-500 mb-2 mt-4">
        {intl.formatMessage(messages.divisionByGroup)}
      </h5>
      <FormSwitchGroup
        onChange={handleChange}
        className="mt-2"
        onBlur={handleBlur}
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
              onBlur={handleBlur}
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
                          name="dividedTopics"
                          onChange={(event) => handleCheckBoxToggle(event, push, remove)}
                          onBlur={handleBlur}
                          defaultValue={divideDiscussionIds}
                        >
                          {validDiscussionTopics.map((topic) => (
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
};

DivisionByGroupFields.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DivisionByGroupFields);
