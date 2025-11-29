import { Button, Form, Spinner } from '@openedx/paragon';
import { Send } from '@openedx/paragon/icons';

import { Formik } from 'formik';
import { Fragment, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { AssistantEditorFormPropI } from '../types';

const AIAssistantChat = ({
  messages,
  onSend,
  isLoading,
  isReady,
  placeholder,
}: AssistantEditorFormPropI) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [messages]);

  const adjustTextareaHeight = (el: HTMLTextAreaElement) => {
    if (el) {
      // eslint-disable-next-line no-param-reassign
      el.style.height = 'auto';
      // eslint-disable-next-line no-param-reassign
      el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="ai-assistant-chat">
      <div className="ai-assistant-chat__message-area">
        {messages && messages.map((msg) => (
          <Fragment key={msg.id}>
            <div
              className={classNames(
                'ai-assistant-chat__message',
                {
                  'ai-assistant-chat__message--user': msg.type === 'user',
                  'ai-assistant-chat__message--ai': msg.type === 'ai',
                },
              )}
            >
              {msg.text}
            </div>
          </Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Formik
        initialValues={{ prompt: '' }}
        enableReinitialize={false}
        onSubmit={(values, { resetForm }) => {
          if (!values.prompt.trim()) {
            return;
          }
          onSend(values.prompt);
          resetForm();

          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <Form className="ai-assistant-chat__form" onSubmit={handleSubmit}>
            <div className="ai-assistant-chat__input-wrapper">
              <Form.Control
                as="textarea"
                id="prompt"
                name="prompt"
                ref={textareaRef}
                value={values.prompt}
                placeholder={placeholder}
                className="ai-assistant-chat__textarea"
                rows={1}
                disabled={isLoading || !isReady}
                onChange={(e) => {
                  handleChange(e);
                  adjustTextareaHeight(e.target as HTMLTextAreaElement);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="ai-assistant-chat__send-btn"
              disabled={isLoading || !isReady || !values.prompt.trim()}
            >
              {isLoading ? (
                <Spinner animation="border" variant="light" screenReaderText="Loading..." size="sm" />
              ) : (
                <Send />
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AIAssistantChat;
