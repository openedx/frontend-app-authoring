import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useFormikContext } from 'formik';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Card, Form, TransitionReplace,
} from '@edx/paragon';

import CollapsableEditor from '../../../../../../generic/CollapsableEditor';
import messages from '../messages';

const TopicItem = ({
  intl,
  index,
  id,
  name,
  onDelete,
  hasError,
  onFocus,
}) => {
  const {
    handleChange, handleBlur, errors,
  } = useFormikContext();
  const [inFocus, setInFocus] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [collapseIsOpen, setCollapseOpen] = useState(!name || hasError);
  const isGeneralTopic = id === 'course';

  useEffect(() => {
    onFocus(hasError);
  }, [inFocus, hasError]);

  const getHeading = (isOpen) => {
    if (isGeneralTopic && isOpen) {
      return (
        <div className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.renameGeneralTopic)}
          <div className="small text-muted mt-2">
            {intl.formatMessage(messages.generalTopicHelp)}
          </div>
        </div>
      );
    } if (isOpen) {
      return (
        <span className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.configureAdditionalTopic)}
        </span>
      );
    }
    return <span className="py-2">{name}</span>;
  };

  const handleToggle = (isOpen) => {
    if (!isOpen && (!name.length || hasError)) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  };

  const deleteDiscussionTopic = () => {
    setShowDeletePopup(true);
  };

  const renderFormFeedback = (message, messageType = 'default') => (
    <Form.Control.Feedback type={messageType} hasIcon={false}>
      <div className="small">{message}</div>
    </Form.Control.Feedback>
  );

  const handleFocusOut = (event) => {
    handleBlur(event);
    setInFocus(false);
  };

  const deleteTopicPopup = (
    <Card className="rounded mb-3 p-1">
      <Card.Body>
        <div className="text-primary-500 mb-2 h4">
          {intl.formatMessage(messages.discussionTopicDeletionLabel)}
        </div>
        <Card.Text className="text-justify text-muted">
          {intl.formatMessage(messages.discussionTopicDeletionHelp)}
        </Card.Text>
        <div className="d-flex justify-content-end">
          <Button variant="tertiary" onClick={() => setShowDeletePopup(false)}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button
            variant="outline-brand"
            className="ml-2"
            onClick={onDelete}
          >
            {intl.formatMessage(messages.deleteButton)}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return showDeletePopup
    ? deleteTopicPopup
    : (
      <CollapsableEditor
        open={collapseIsOpen}
        onToggle={handleToggle}
        title={getHeading(collapseIsOpen)}
        onDelete={isGeneralTopic ? null : deleteDiscussionTopic}
        expandAlt={intl.formatMessage(messages.expandAltText)}
        collapseAlt={intl.formatMessage(messages.collapseAltText)}
        deleteAlt={intl.formatMessage(messages.deleteAltText)}
        data-testid={id}
      >
        <Form.Group
          controlId={`discussionTopics.${index}.name`}
          isInvalid={hasError && !inFocus}
          className="m-2"
        >
          <Form.Control
            floatingLabel="Topic name"
            onChange={handleChange}
            onBlur={(event) => handleFocusOut(event)}
            value={name}
            controlClassName="bg-white"
            onFocus={() => setInFocus(true)}
          />
          <TransitionReplace key={id} className="mt-1">
            {inFocus ? (
              <React.Fragment key="open">
                {renderFormFeedback(intl.formatMessage(messages.addTopicHelpText))}
              </React.Fragment>
            ) : (
              <React.Fragment key="closed" />
            )}
          </TransitionReplace>
          <TransitionReplace key={`${name}-${id}`}>
            {hasError && !inFocus ? (
              <React.Fragment key="open">
                {renderFormFeedback(errors?.discussionTopics[index].name, 'invalid')}
              </React.Fragment>
            ) : (
              <React.Fragment key="closed" />
            )}
          </TransitionReplace>
        </Form.Group>
      </CollapsableEditor>
    );
};

TopicItem.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  hasError: PropTypes.bool.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default injectIntl(TopicItem);
