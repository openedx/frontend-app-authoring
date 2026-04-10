import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Form,
  IconButton,
} from '@openedx/paragon';
import {
  EditOutline as EditIcon,
} from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';
import { updateQueryPendingStatus } from '../data/slice';
import messages from './messages';

type HeaderTitleProps = {
  unitTitle: string;
  isTitleEditFormOpen: boolean;
  handleTitleEdit: () => void;
  handleTitleEditSubmit: (title: string) => void;
};

/**
 * Component that renders the title with a button to edit it.
 * - Edit button: Hidden, It appears when you hover over it.
 *   The title becomes a text form.
 */
const HeaderTitle = ({
  unitTitle,
  isTitleEditFormOpen,
  handleTitleEdit,
  handleTitleEditSubmit,
}: HeaderTitleProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [titleValue, setTitleValue] = useState(unitTitle);

  useEffect(() => {
    setTitleValue(unitTitle);
    dispatch(updateQueryPendingStatus(true));
  }, [unitTitle]);

  return (
    <div className="unit-header-title d-flex align-items-center lead" data-testid="unit-header-title">
      {isTitleEditFormOpen ?
        (
          <Form.Group className="m-0">
            <Form.Control
              ref={(e) => e && e.focus()}
              value={titleValue}
              name="displayName"
              onChange={(e) => setTitleValue(e.target.value)}
              aria-label={intl.formatMessage(messages.ariaLabelButtonEdit)}
              onBlur={() => handleTitleEditSubmit(titleValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleEditSubmit(titleValue);
                }
              }}
            />
          </Form.Group>
        ) :
        unitTitle}
      <IconButton
        alt={intl.formatMessage(messages.altButtonEdit)}
        className="ml-1 flex-shrink-0 edit-button"
        iconAs={EditIcon}
        onClick={handleTitleEdit}
      />
    </div>
  );
};

export default HeaderTitle;
