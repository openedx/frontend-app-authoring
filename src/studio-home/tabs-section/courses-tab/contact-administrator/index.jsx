import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Card } from '@openedx/paragon';
import { Add as AddIcon } from '@openedx/paragon/icons/es5';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { getStudioHomeData } from '../../../data/selectors';
import messages from '../../../messages';

const ContactAdministrator = ({
  intl, hasAbilityToCreateCourse, showNewCourseContainer, onClickNewCourse,
}) => {
  const { studioShortName } = useSelector(getStudioHomeData);

  return (
    <Card variant="muted">
      <Card.Section
        title={intl.formatMessage(messages.defaultSection_1_Title, { studioShortName })}
        className="small"
      >
        {intl.formatMessage(messages.defaultSection_1_Description)}
      </Card.Section>
      {hasAbilityToCreateCourse && (
        <>
          <Card.Divider />
          <Card.Section
            className="small"
            title={intl.formatMessage(messages.defaultSection_2_Title)}
            actions={(
              <Button
                iconBefore={AddIcon}
                variant="outline-primary"
                data-testid="contact-admin-create-course"
                disabled={!hasAbilityToCreateCourse || showNewCourseContainer}
                onClick={onClickNewCourse}
              >
                {intl.formatMessage(messages.btnAddNewCourseText)}
              </Button>
            )}
          >
            {intl.formatMessage(messages.defaultSection_2_Description)}
          </Card.Section>
        </>
      )}
    </Card>
  );
};

ContactAdministrator.defaultProps = {
  hasAbilityToCreateCourse: false,
};

ContactAdministrator.propTypes = {
  intl: intlShape.isRequired,
  hasAbilityToCreateCourse: PropTypes.bool,
  showNewCourseContainer: PropTypes.bool.isRequired,
  onClickNewCourse: PropTypes.func.isRequired,
};

export default injectIntl(ContactAdministrator);
