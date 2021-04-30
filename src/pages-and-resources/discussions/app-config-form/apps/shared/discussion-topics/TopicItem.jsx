import { Collapsible, Form } from '@edx/paragon';
import React, { useState } from 'react';
import messages from '../messages';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ExpandLess, ExpandMore } from '@edx/paragon/icons';

function TopicItem({ name, intl }) {
  const {
    handleSubmit,
    data,
    handleChange,
    handleBlur,
    values,
    touched,
    errors,
    validateForm,
  } = useFormik({
    initialValues: { topicNameKey: name },
    validationSchema: Yup.object().shape({
      topicNameKey: Yup.string()
        .required
        // intl.formatMessage('lahore is missing'),
        (),
    }),
  });
  const [title, setTitle] = useState(name);
  const isInvalidtopicNameKey = !!(touched.topicNameKey && errors.topicNameKey);
  const isNewTopic = title === '';

  const getHeading = (isOpen = false) => {
    if (isNewTopic) {
      return <span className="h4 p-2">Configure topic</span>;
    }
    if (isOpen) {
      return <span className="h4 p-2">Rename {title} topic</span>;
    }
    return <span className="p-2">{title}</span>;
  };

  const handleToggle = (isOpen) => {
    console.log('Collapsible toggled and open is: ', isOpen);
    if (!isOpen && !isInvalidtopicNameKey) {
      setTitle(values.topicNameKey);
    }
  };
  
  return (
    <>
      <Collapsible.Advanced
        className="collapsible-card rounded mb-3"
        onToggle={handleToggle}
        defaultOpen={isNewTopic}
      >
        <Collapsible.Trigger className="collapsible-trigger d-flex border-0">
          <Collapsible.Visible whenClosed>
            {getHeading(false)}
            <div>
              <ExpandMore />
            </div>
          </Collapsible.Visible>
          <Collapsible.Visible whenOpen>
            {getHeading(true)}
            <ExpandLess />
          </Collapsible.Visible>
        </Collapsible.Trigger>
        <Collapsible.Body className="collapsible-body rounded">
          <Form.Group
            controlId="topicNameKey"
            isInvalid={isInvalidtopicNameKey}
            className="m-2"
            size="sm"
          >
            <Form.Control
              floatingLabel="Topic name"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.topicNameKey}
            />
            {isInvalidtopicNameKey && (
              <Form.Control.Feedback type="invalid" hasIcon={false}>
                <div className="small">Topic name is a required fields</div>
              </Form.Control.Feedback>
            )}
            {!isInvalidtopicNameKey && (
              <Form.Control.Feedback>
                <div className="small">Choose a unique name for your topic</div>
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Collapsible.Body>
      </Collapsible.Advanced>
    </>
  );
}

TopicItem.propTypes = {};

export default injectIntl(TopicItem);
