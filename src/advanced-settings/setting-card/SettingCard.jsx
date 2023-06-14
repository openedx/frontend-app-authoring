import React from 'react';
import {
  Card, Form, Icon, IconButton, OverlayTrigger, Popover,
} from '@edx/paragon';
import { Info, Warning } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import TextareaAutosize from 'react-textarea-autosize';

import messages from './messages';

const SettingCard = ({
  intl, showDeprecated, name, onChange, value, settingData,
}) => {
  const { deprecated, help, displayName } = settingData;
  return (
    <li className={classNames('field-group course-advanced-policy-list-item', { 'd-none': deprecated && !showDeprecated })}>
      <Card className="flex-column setting-card">
        <Card.Body className="d-flex justify-content-between">
          <Card.Header
            title={displayName}
            subtitle={(
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={(
                  <Popover id="popover-positioned">
                    <Popover.Content>
                      {/* eslint-disable-next-line react/no-danger */}
                      <div dangerouslySetInnerHTML={{ __html: help }} />
                    </Popover.Content>
                  </Popover>
                )}
              >
                <IconButton
                  src={Info}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages.helpButtonText)}
                  variant="light"
                />
              </OverlayTrigger>
            )}
          />
          <Card.Section>
            <Form.Group className="m-0">
              <Form.Control
                as={TextareaAutosize}
                value={typeof value === 'object' ? JSON.stringify(value, null, 4) : value.toString()}
                name={name}
                onChange={onChange}
                aria-label={displayName}
              />
            </Form.Group>
          </Card.Section>
        </Card.Body>
        {deprecated && (
          <Card.Status icon={Warning} variant="danger">
            {intl.formatMessage(messages.deprecated)}
          </Card.Status>
        )}
      </Card>
    </li>
  );
};

SettingCard.propTypes = {
  intl: intlShape.isRequired,
  settingData: PropTypes.shape({
    deprecated: PropTypes.bool,
    help: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  onChange: PropTypes.func.isRequired,
  showDeprecated: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

SettingCard.defaultProps = {
  value: undefined,
};

export default injectIntl(SettingCard);
