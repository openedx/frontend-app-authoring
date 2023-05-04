/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Button } from '@edx/paragon';
import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

const DiscussionRestrictionOption = ({
  intl,
  name,
  key,
  id,
  onClick,
  selectedOption,
}) => (
  <Col
    id={id}
    key={key}
    columnSizes={{
      xs: 12, sm: 4, lg: 4, xl: 4,
    }}
  >
    <Button
      variant="plain"
      className={`w-100 border border-light-400 rounded-0 font-14 height-36
      ${selectedOption === intl.formatMessage(name) ? 'text-white btn-active' : 'btn-tertiary'}`}
      onClick={() => onClick(intl.formatMessage(name))}
    >
      {intl.formatMessage(name)}
    </Button>
  </Col>
  );

DiscussionRestrictionOption.propTypes = {
  name: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  selectedOption: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionRestrictionOption);
