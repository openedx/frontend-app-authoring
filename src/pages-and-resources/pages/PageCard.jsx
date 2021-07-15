import { history } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Card, Icon, IconButton, Badge,
} from '@edx/paragon';
import { Settings } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import messages from '../messages';
import { PagesAndResourcesContext } from '../PagesAndResourcesProvider';

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

  return (
    <Card
      className="shadow card"
      style={{
        width: '19rem',
        height: '14rem',
      }}
    >
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title className="d-flex mb-0 align-items-center justify-content-between">
            <h4 className="m-0 p-0">{page.name}</h4>
            {(page.allowedOperations.configure || page.allowedOperations.enable)
          && (
            <IconButton
              className="mb-0 mr-1"
              src={Settings}
              iconAs={Icon}
              size="inline"
              alt={intl.formatMessage(messages.settings)}
              onClick={() => history.push(`${pagesAndResourcesPath}/${page.id}/settings`)}
            />
          )}
          </Card.Title>
          {
            page.enabled && (
              <Badge className="py-1" variant="success">
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
