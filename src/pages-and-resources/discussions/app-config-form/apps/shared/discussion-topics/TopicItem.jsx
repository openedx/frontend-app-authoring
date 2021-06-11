import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Collapsible, Form, Card, Button, IconButton, Icon,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useFormikContext } from 'formik';
import { ExpandLess, ExpandMore, Delete } from '@edx/paragon/icons';
import messages from '../messages';
import {
  updateValidationStatus,
} from '../../../../data/slice';

const TopicItem = ({
  intl, index, name, onDelete, id,
}) => {
  const [title, setTitle] = useState(name);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [collapseIsOpen, setCollapseOpen] = useState(!name.length);

  const {
    handleChange,
    handleBlur,
    touched,
    errors,
  } = useFormikContext();
  const dispatch = useDispatch();
  const isGeneralTopic = id === 'course';

  useEffect(() => {
    setTitle(name);
  }, [name]);

  useEffect(() => {
    if (Object.keys(touched).length) {
      dispatch(updateValidationStatus({ hasError: Object.keys(errors).length > 0 }));
    }
  }, [errors, touched]);

  const isInvalidTopicNameKey = Boolean(
    (touched.discussionTopics && touched.discussionTopics[index]?.name)
    && (errors.discussionTopics && errors?.discussionTopics[index]?.name),
  );

  const isExistingName = Boolean(
    (touched.discussionTopics && touched.discussionTopics[index]?.name)
    && (errors && errors[index]?.name),
  );

  const getHeading = (isOpen = false) => {
    let heading;
    if (isGeneralTopic && isOpen) {
      heading = (
        <div className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.renameGeneralTopic)}
          <div className="small text-muted mt-2">{intl.formatMessage(messages.generalTopicHelp)}</div>
        </div>
      );
    } else if (isOpen) {
      heading = <span className="h4 py-2 mr-auto">{intl.formatMessage(messages.configureAdditionalTopic)}</span>;
    } else {
      heading = <span className="py-2">{title}</span>;
    }
    return heading;
  };

  const collapseCardValidation = (isOpen) => {
    const inputIsUnTouch = isOpen || !title.length;
    const inputHasError = !isOpen && (!title.length || isExistingName);

    if (inputHasError || inputIsUnTouch) {
      setCollapseOpen(true);
    } else {
      setCollapseOpen(false);
    }
  };

  const updateTitle = (isOpen) => {
    const inputHasError = !isOpen && !isInvalidTopicNameKey && !isExistingName;
    if (inputHasError) {
      setTitle(name);
    }
  };

  const handleToggle = (isOpen) => {
    collapseCardValidation(isOpen);
    updateTitle(isOpen);
  };

  const deleteDiscussionTopic = (event) => {
    event.stopPropagation();
    setShowDeletePopup(true);
  };

  const deletetopic = (
    <Card className="rounded mb-3 p-1">
      <Card.Body>
        <div className="text-primary-500 mb-2 h4">
          {intl.formatMessage(messages.discussionTopicDeletionLabel)}
        </div>
        <Card.Text className="text-justify text-muted">
          {intl.formatMessage(messages.discussionTopicDeletionHelp)}
        </Card.Text>
        <div className="d-flex justify-content-end">
          <Button
            variant="tertiary"
            onClick={() => setShowDeletePopup(false)}
          >
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            variant="outline-brand"
            className="ml-2"
            onClick={() => onDelete()}
          >
            {intl.formatMessage(messages.deleteButton)}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <>
      {
        showDeletePopup ? (
          deletetopic
        ) : (
          <Collapsible.Advanced
            className="collapsible-card rounded mb-3 px-3 py-2"
            onToggle={handleToggle}
            defaultOpen={!title}
            open={collapseIsOpen}
            id={id}
          >
            <Collapsible.Trigger
              className="collapsible-trigger d-flex border-0"
              style={{ justifyContent: 'unset' }}
            >
              <Collapsible.Visible whenClosed>
                {getHeading(false)}
                <div className="ml-auto">
                  <IconButton
                    alt={intl.formatMessage(messages.expandAltText)}
                    src={ExpandMore}
                    iconAs={Icon}
                    variant="dark"
                  />
                </div>
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                {getHeading(true)}
                {
                  !isGeneralTopic && (
                    <div className="pr-4 border-right">
                      <IconButton
                        onClick={deleteDiscussionTopic}
                        alt={intl.formatMessage(messages.deleteAltText)}
                        src={Delete}
                        iconAs={Icon}
                        variant="dark"
                      />
                    </div>
                  )
                }
                <div className="pl-4">
                  <IconButton
                    alt={intl.formatMessage(messages.collapseAltText)}
                    src={ExpandLess}
                    iconAs={Icon}
                    variant="dark"
                  />
                </div>
              </Collapsible.Visible>
            </Collapsible.Trigger>
            <Collapsible.Body className="collapsible-body rounded px-0">
              <Form.Group
                controlId={`discussionTopics.${index}.name`}
                isInvalid={isInvalidTopicNameKey}
                className="m-2"
              >
                <Form.Control
                  floatingLabel="Topic name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={name}
                  controlClassName="bg-white"
                />
                {isInvalidTopicNameKey && (
                  <Form.Control.Feedback type="invalid" hasIcon={false}>
                    <div className="small">
                      {intl.formatMessage(messages.discussionTopicRequired)}
                    </div>
                  </Form.Control.Feedback>
                )}
                {isExistingName && (
                  <Form.Control.Feedback type="invalid" hasIcon={false}>
                    <div className="small">
                      {intl.formatMessage(messages.discussionTopicNameAlreadyExist)}
                    </div>
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
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TopicItem);
