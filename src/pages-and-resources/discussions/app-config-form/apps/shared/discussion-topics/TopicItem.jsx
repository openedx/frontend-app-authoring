import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Collapsible, Form, Card, Button,
} from '@edx/paragon';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { useFormikContext } from 'formik';
import { ExpandLess, ExpandMore, Delete } from '@edx/paragon/icons';

const TopicItem = ({
  index, name, onDelete,
}) => {
  const [title, setTitle] = useState(name);
  const [isRemove, setIsRemove] = useState(false);
  const {
    handleChange,
    handleBlur,
    touched,
    errors,
  } = useFormikContext();
  const isInvalidtopicNameKey = (
    (touched?.discussionTopics && touched.discussionTopics[index]?.name)
    && (errors?.discussionTopics && errors?.discussionTopics[index]?.name)
  );

  const getHeading = (isOpen = false) => {
    let heading;
    if (!title) {
      heading = <span className="h4 py-2 mr-auto">Configure topic</span>;
    } else if (isOpen) {
      heading = <span className="h4 py-2 mr-auto">Rename {title} topic</span>;
    } else {
      heading = <span className="py-2">{title}</span>;
    }
    return heading;
  };

  const handleToggle = (isOpen) => {
    if (!isOpen && !isInvalidtopicNameKey) {
      setTitle(name);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    setIsRemove(true);
  };

  return (
    <>
      {
        isRemove ? (
          <Card className="rounded mb-3 p-1">
            <Card.Body>
              <div className="h4 card-title">Delete this topic?</div>
              <Card.Text className="text-gray-700 text-justify">
                edX recommends that you do not delete discussion topics once your course is running.
              </Card.Text>
              <div className="d-flex justify-content-end">
                <Button
                  variant="tertiary"
                  onClick={() => setIsRemove(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline-brand"
                  className="ml-2"
                  onClick={() => onDelete(index)}
                >
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Collapsible.Advanced
            className="collapsible-card rounded mb-3 px-3 py-2"
            onToggle={handleToggle}
            defaultOpen={!title}
          >
            <Collapsible.Trigger
              className="collapsible-trigger d-flex border-0"
              style={{ justifyContent: 'unset' }}
            >
              <Collapsible.Visible whenClosed>
                {getHeading(false)}
                <div className="py-2 ml-auto">
                  <ExpandMore />
                </div>
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                {getHeading(true)}
                {name !== 'General' && (
                  <div className="pr-4 border-right">
                    <Delete onClick={handleDelete} />
                  </div>
                )}
                <div className="pl-4">
                  <ExpandLess />
                </div>
              </Collapsible.Visible>
            </Collapsible.Trigger>
            <Collapsible.Body className="collapsible-body rounded px-0">
              <Form.Group
                controlId={`discussionTopics.${index}.name`}
                isInvalid={isInvalidtopicNameKey}
                className="m-2"
              >
                <Form.Control
                  floatingLabel="Topic name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={name}
                  readOnly={name === 'General'}
                  controlClassName="bg-white"
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
        )
      }
    </>
  );
};

TopicItem.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default injectIntl(TopicItem);
