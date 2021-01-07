import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Container, Row } from '@edx/paragon';
import PropTypes from 'prop-types';
import DiscussionToolOption from './discussion-tool-option/DiscussionToolOption';
import FeaturesTable from './features-table/FeaturesTable';
import messages from '../messages';

function DiscussionToolSelector({
  intl, forums, featuresList, onSelectForum, selectedForumId,
}) {
  return (
    <Container fluid className="text-info-500">
      <h6 className="my-4 text-center">{intl.formatMessage(messages.heading)}</h6>

      <Row>
        {forums.map(forum => (
          <DiscussionToolOption
            key={forum.forumId}
            forum={forum}
            selected={forum.forumId === selectedForumId}
            onSelect={onSelectForum}
          />
        ))}
      </Row>

      <h2 className="my-3">{intl.formatMessage(messages.supportedFeatures)}</h2>

      <FeaturesTable forums={forums} featuresList={featuresList} />
    </Container>
  );
}

DiscussionToolSelector.propTypes = {
  intl: intlShape.isRequired,
  forums: PropTypes.arrayOf(PropTypes.object).isRequired,
  featuresList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelectForum: PropTypes.func.isRequired,
  selectedForumId: PropTypes.string.isRequired,
};

export default injectIntl(DiscussionToolSelector);
