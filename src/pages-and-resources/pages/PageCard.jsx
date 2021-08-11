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
  allowedOperations: PropTypes.shape({
    enable: PropTypes.bool.isRequired,
    configure: PropTypes.bool.isRequired,
  }).isRequired,
});

export { CoursePageShape };

function PageCard({
  intl,
  page,
}) {
  const { path: pagesAndResourcesPath } = useContext(PagesAndResourcesContext);
  const isDesktop = useIsDesktop();

  const SettingsButton = () => {
    if (page.legacyLink) {
      return (
        <Hyperlink destination={page.legacyLink}>
          <IconButton
            className="mb-0 mr-1"
            src={ArrowForward}
            iconAs={Icon}
            size="inline"
            alt={intl.formatMessage(messages.settings)}
            onClick={() => {}}
          />
        </Hyperlink>
      );
    }
    return (page.allowedOperations.configure || page.allowedOperations.enable) && (
      <IconButton
        className="mb-0 mr-1"
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
      className={classNames(
        'shadow card',
        {
          'desktop-card': isDesktop,
          'mobile-card': !isDesktop,
        },
      )}
    >
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title className="d-flex mb-1 align-items-center justify-content-between">
            <h4 className="m-0 p-0">{page.name}</h4>
            <SettingsButton />
          </Card.Title>
          {
            page.enabled && (
              <Badge variant="success">
                {intl.formatMessage(messages.enabled)}
              </Badge>
            )
          }
        </div>
        <Card.Text className="m-0">
          {page.description}
        </Card.Text>

      </Card.Body>
    </Card>
  );
}

PageCard.propTypes = {
  intl: intlShape.isRequired,
  page: CoursePageShape.isRequired,
};

export default injectIntl(PageCard);
