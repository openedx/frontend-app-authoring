import { history } from '@edx/frontend-platform';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Badge, Card, Icon, IconButton, Hyperlink,
} from '@edx/paragon';
import { ArrowForward, Settings } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';
import { useIsDesktop } from '../../utils';
import './PageCard.scss';

const CoursePageShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  legacyLink: PropTypes.string,
  allowedOperations: PropTypes.shape({
    enable: PropTypes.bool.isRequired,
    configure: PropTypes.bool.isRequired,
  }).isRequired,
});

export { CoursePageShape };

const PageCard = ({
  intl,
  page,
}) => {
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const isDesktop = useIsDesktop();
  // eslint-disable-next-line react/no-unstable-nested-components
  const SettingsButton = () => {
    if (page.legacyLink) {
      return (
        <Hyperlink destination={page.legacyLink}>
          <IconButton
            src={ArrowForward}
            iconAs={Icon}
            size="inline"
            alt={intl.formatMessage(messages.settings)}
          />
        </Hyperlink>
      );
    }
    return (page.allowedOperations.configure || page.allowedOperations.enable) && (
      <IconButton
        src={Settings}
        iconAs={Icon}
        size="inline"
        alt={intl.formatMessage(messages.settings)}
        onClick={() => history.push(`${pagesAndResourcesPath}/${page.id}/settings`)}
      />
    );
  };

  return (
    <Card
      className={classNames('shadow justify-content-between', {
        'desktop-card': isDesktop,
        'mobile-card': !isDesktop,
      })}
    >
      <Card.Header
        title={page.name}
        subtitle={page.enabled && (
          <Badge variant="success" className="mt-1">
            {intl.formatMessage(messages.enabled)}
          </Badge>
        )}
        actions={<div className="mt-1"><SettingsButton /></div>}
        size="sm"
      />
      <Card.Body>
        <Card.Section>
          {page.description}
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

PageCard.propTypes = {
  intl: intlShape.isRequired,
  page: CoursePageShape.isRequired,
};

export default injectIntl(PageCard);
