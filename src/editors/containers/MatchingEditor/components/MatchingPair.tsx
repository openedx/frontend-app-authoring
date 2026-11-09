import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Dropdown, Icon, IconButton } from '@openedx/paragon';
import { ExpandLess, ExpandMore, MoreHoriz } from '@openedx/paragon/icons';

import { SortableItem } from '@src/generic/DraggableList';
import messages from '@src/editors/containers/MatchingEditor/messages';
import type { MatchingState } from '@src/editors/containers/MatchingEditor/types';
import CardField from './CardField';
import { useFormikContext } from 'formik';
import { PairPreview } from './PairPreview';

interface MatchingCardProps {
  index: number;
  onDelete: () => void;
  onMoveUp: (() => void) | null;
  onMoveDown: (() => void) | null;
}

/** One pair of the game: a collapsible, draggable card. */
const MatchingPair = ({
  index,
  onDelete,
  onMoveUp,
  onMoveDown,
}: MatchingCardProps) => {
  const intl = useIntl();
  const { values, setFieldValue } = useFormikContext<MatchingState>();
  const pair = values.pairs[index];
  // values could be empty while the state is being fetched(?)
  if (pair == undefined) { return null; }

  const onToggle = (value: boolean) => {
    void setFieldValue(`pairs.${index}.editorOpen`, value);
  };

  return (
    <SortableItem
      id={pair.key}
      actions={null}
      actionStyle={{
        position: 'absolute',
        top: 'calc(var(--pgn-spacing-spacer-base) * 0.55)',
        left: 'calc(var(--pgn-spacing-spacer-base) * 0.25)',
        zIndex: 2,
      }}
      componentStyle={{
        borderRadius: '6px',
        boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        position: 'relative',
        width: '100%',
        flexDirection: 'column',
        marginBottom: '1rem',
      }}
    >
      <Collapsible.Advanced
        // Paragon's .card supplies the themed background.
        className="card d-flex flex-column align-items-start align-self-stretch w-100 position-relative"
        open={pair.editorOpen}
        onToggle={onToggle}
      >
        <div className="d-flex align-items-center w-100 p-2">
          <Collapsible.Trigger className="d-flex align-items-center flex-grow-1 pl-2">
            <div className="d-flex align-items-center align-self-stretch w-100 ml-4">
              <div className="mx-2.5 text-primary-500 font-weight-bold">
                {index + 1}
              </div>
              {!pair.editorOpen
                ? <PairPreview pair={pair} />
                : <div className="d-flex align-self-stretch flex-grow-1" />}
            </div>
          </Collapsible.Trigger>
          {/* Siblings of the trigger: a button nested in a button is invalid markup. */}
          <Dropdown>
            <Dropdown.Toggle
              style={{ zIndex: '10' }}
              as={IconButton}
              src={MoreHoriz}
              iconAs={Icon}
              alt={intl.formatMessage(messages.cardActionsLabel)}
              variant="primary"
            />
            <Dropdown.Menu align="right">
              {onMoveUp !== null &&
                (
                  <Dropdown.Item onClick={onMoveUp}>
                    {intl.formatMessage(messages.moveUpLabel)}
                  </Dropdown.Item>
                )}
              {onMoveDown !== null &&
                (
                  <Dropdown.Item onClick={onMoveDown}>
                    {intl.formatMessage(messages.moveDownLabel)}
                  </Dropdown.Item>
                )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={onDelete}>
                {intl.formatMessage(messages.deleteLabel)}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <IconButton
            src={pair.editorOpen ? ExpandLess : ExpandMore}
            iconAs={Icon}
            alt={intl.formatMessage(pair.editorOpen ? messages.collapseCardLabel : messages.expandCardLabel)}
            variant="primary"
            onClick={() => onToggle(!pair.editorOpen)}
          />
        </div>
        <div className="w-100 position-relative p-0">
          <Collapsible.Body>
            <hr className="m-0" />
            <CardField
              side="left"
              index={index}
            />
            <hr className="m-0" />
            <CardField
              side="right"
              index={index}
            />
          </Collapsible.Body>
        </div>
      </Collapsible.Advanced>
    </SortableItem>
  );
};

export default MatchingPair;
