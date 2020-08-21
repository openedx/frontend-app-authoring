import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Col, Form, Row } from '@edx/paragon';
import * as PropTypes from 'prop-types';
import React from 'react';
import messages from './messages';

function FormSwitchGroup({ intl, messageKey, padded }) {
  return (
    <Form.Group as={Row} className={padded && 'pl-4'}>
      <Form.Label className="pl-0" column>
        {intl.formatMessage(messages[`${messageKey}_label`])}
      </Form.Label>
      <Form.Switch label="" aria-describedby={messageKey} />
      <Form.Text id={messageKey} muted>
        {intl.formatMessage(messages[`${messageKey}_help`])}
      </Form.Text>
    </Form.Group>
  );
}
FormSwitchGroup.propTypes = {
  intl: intlShape.isRequired,
  messageKey: PropTypes.string.isRequired,
  padded: PropTypes.bool,
};
FormSwitchGroup.defaultProps = {
  padded: false,
};

function BaseForumSettingEditor({ intl }) {
  const divider = <hr style={{ margin: '0 -2rem' }} className="my-2" />;
  return (
    <Form className="mx-3">
      <Row><Form.Text>{intl.formatMessage(messages.division_by_group)}</Form.Text></Row>
      <FormSwitchGroup messageKey="divide_by_cohorts" intl={intl} />
      <FormSwitchGroup messageKey="allow_division_by_unit" intl={intl} padded />
      <FormSwitchGroup messageKey="divide_course_wide_topics" intl={intl} />
      {/* TODO: wire in data here */}
      <Form.Group as={Col}>
        {['General', 'Questions for the TAs'].map(item => (
          <Form.Check label={item} />
        ))}
      </Form.Group>
      {divider}
      <Row>
        <Form.Text>{intl.formatMessage(messages.visibility_in_context)}</Form.Text>
      </Row>
      <FormSwitchGroup messageKey="in_context_discussion" intl={intl} />
      <FormSwitchGroup messageKey="graded_unit_pages" intl={intl} padded />
      <FormSwitchGroup messageKey="group_in_context_subsection" intl={intl} padded />
      <FormSwitchGroup messageKey="allow_unit_level_visibility" intl={intl} padded />
      {divider}
      <Row>
        <Form.Text>{intl.formatMessage(messages.anonymous_posting)}</Form.Text>
      </Row>
      <FormSwitchGroup messageKey="allow_anonymous_posts" intl={intl} />
      <FormSwitchGroup messageKey="allow_anonymous_posts_peers" intl={intl} />
      <Form.Group as={Row}>
        <Form.Label>{intl.formatMessage(messages.blackout_dates_label)}</Form.Label>
        <Form.Control aria-describedby="blackoutDates" />
        <Form.Text id="blackoutDates" muted>
          {intl.formatMessage(messages.blackout_dates_help)}
        </Form.Text>
      </Form.Group>
    </Form>
  );
}

BaseForumSettingEditor.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BaseForumSettingEditor);
