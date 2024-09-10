import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Container,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import messages from '../messages';
import ExpandableTextArea from '../../../../../../sharedComponents/ExpandableTextArea';

const HintRow = ({
  value,
  handleChange,
  handleDelete,
  id,
  images,
  isLibrary,
  learningContextId,
  // injected
  intl,
}) => (
  <ActionRow className="mb-4">
    <Container fluid className="p-0">
      <ExpandableTextArea
        value={value}
        setContent={handleChange}
        placeholder={intl.formatMessage(messages.hintInputLabel)}
        id={`hint-${id}`}
        {...{
          images,
          isLibrary,
          learningContextId,
        }}
      />
    </Container>
    <div className="d-flex flex-row flex-nowrap">
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt={intl.formatMessage(messages.settingsDeleteIconAltText)}
        onClick={handleDelete}
        variant="primary"
      />
    </div>
  </ActionRow>
);

HintRow.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  images: PropTypes.shape({}).isRequired,
  learningContextId: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const HintRowInternal = HintRow; // For testing only
export default injectIntl(HintRow);
