import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import Responsive from 'react-responsive';
import {
  Card, CheckboxControl, breakpoints,
} from '@edx/paragon';
import messages from './messages';
import appMessages from '../app-config-form/messages';
import FeaturesList from './FeaturesList';

function AppCard({
  app, onClick, intl, selected, features,
}) {
  const { canChangeProviders } = useSelector(state => state.courseDetail);
  const supportText = app.hasFullSupport
    ? intl.formatMessage(messages.appFullSupport)
    : intl.formatMessage(messages.appBasicSupport);

  return (
    <Card
      isClickable
      onClick={() => canChangeProviders && onClick(app.id)}
      onKeyPress={() => canChangeProviders && onClick(app.id)}
      className={classNames({
        'border-primary': selected,
      }, 'w-100')}
    >
      <Card.Header
        title={intl.formatMessage(appMessages[`appName-${app.id}`])}
        subtitle={<div className="h6 text-muted">{supportText}</div>}
        actions={(
          <div className="mt-2.5">
            <CheckboxControl
              checked={selected}
              disabled={!canChangeProviders}
              readOnly
              aria-label={intl.formatMessage(messages.selectApp, {
                appName: intl.formatMessage(appMessages[`appName-${app.id}`]),
              })}
            />
          </div>
        )}
        size="sm"
      />
      <Card.Body>
        <Card.Section className="pt-2">
          {intl.formatMessage(messages[`appDescription-${app.id}`])}
          <Responsive maxWidth={breakpoints.extraSmall.maxWidth}>
            <FeaturesList
              features={features}
              app={app}
            />
          </Responsive>
        </Card.Section>
      </Card.Body>
    </Card>
  );
}

AppCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    featureIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    hasFullSupport: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  features: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default injectIntl(AppCard);
