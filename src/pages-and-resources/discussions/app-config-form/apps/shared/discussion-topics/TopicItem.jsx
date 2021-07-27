import React, { useState, useEffect } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button,
  Card,
  Collapsible,
  Form,
  Icon,
  IconButton,
  TransitionReplace,
} from '@edx/paragon';
import { Delete, ExpandLess, ExpandMore } from '@edx/paragon/icons';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
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
  const [collapseIsOpen, setCollapseOpen] = useState();
  const isGeneralTopic = id === 'course';

  useEffect(() => {
    onFocus(hasError);
  }, [inFocus, hasError]);

  const getHeading = (isOpen = false) => {
    let heading;
    if (isGeneralTopic && isOpen) {
      heading = (
        <div className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.renameGeneralTopic)}
          <div className="small text-muted mt-2">
            {intl.formatMessage(messages.generalTopicHelp)}
          </div>
        </div>
      );
    } else if (isOpen) {
      heading = (
        <span className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.configureAdditionalTopic)}
        </span>
      );
    } else {
      heading = <span className="py-2">{name}</span>;
    }
    return heading;
  };

  const handleToggle = (isOpen) => {
    if (!isOpen && (!name.length || hasError)) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  };

  const deleteDiscussionTopic = (event) => {
    event.stopPropagation();
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
      {showDeletePopup ? (
        deleteTopicPopup
      ) : (
        <Collapsible.Advanced
          className="collapsible-card rounded mb-3 px-3 py-2"
          onToggle={handleToggle}
          defaultOpen={!name || hasError}
          open={collapseIsOpen}
          data-testid={id}
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
                  onClick={() => {}}
                  variant="dark"
                />
              </div>
            </Collapsible.Visible>
            <Collapsible.Visible whenOpen>
              {getHeading(true)}
              {!isGeneralTopic && (
                <div className="pr-4 border-right">
                  <IconButton
                    onClick={deleteDiscussionTopic}
                    alt={intl.formatMessage(messages.deleteAltText)}
                    src={Delete}
                    iconAs={Icon}
                    variant="dark"
                  />
                </div>
              )}
              <div className="pl-4">
                <IconButton
                  alt={intl.formatMessage(messages.collapseAltText)}
                  src={ExpandLess}
                  iconAs={Icon}
                  onClick={() => {}}
                  variant="dark"
                />
              </div>
            </Collapsible.Visible>
          </Collapsible.Trigger>
          <Collapsible.Body className="collapsible-body rounded px-0">
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
          </Collapsible.Body>
        </Collapsible.Advanced>
      )}
    </>
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
