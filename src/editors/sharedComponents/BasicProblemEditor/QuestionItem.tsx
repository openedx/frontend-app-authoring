import React from 'react';
import PropTypes from 'prop-types';
import {
  Collapsible, Icon, Card, IconButton, Dropdown, Truncate,
} from '@openedx/paragon';
import {
  DragIndicator, KeyboardArrowUp, KeyboardArrowDown, MoreHoriz,
} from '@openedx/paragon/icons';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionWidget from '../../containers/ProblemEditor/components/EditProblemView/QuestionWidget';
import AnswerWidget from '../../containers/ProblemEditor/components/EditProblemView/AnswerWidget';
import ExplanationWidget from '../../containers/ProblemEditor/components/EditProblemView/ExplanationWidget';

// import messages from './messages';

const QuestionItem = ({
  question, isQuesetionCollapsibleOpen, toggleCollapsibleOpen, problemType,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    position: 'relative',
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 200 : undefined,
  };

  return (
    <div style={style} ref={setNodeRef} {...attributes}>
      <Card className={`QuestionCard my-3 ${isQuesetionCollapsibleOpen ? 'is-selected' : ''}`}>

        <Card.Section className="QuestionCardTitleSection" key="QuestionCard-header">
          <Collapsible.Advanced
            className="d-flex align-items-center"
            open={isQuesetionCollapsibleOpen}
            onClick={toggleCollapsibleOpen}
          >
            <IconButton
              {...listeners}
              src={DragIndicator}
              ref={setActivatorNodeRef}
              iconAs={Icon}
              alt="DragIcon"
              className="flex-shrink-0 text-gray-500 mr-2"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            <div className="h4 font-weight-bold text-primary-500 mb-0 mr-3">{question.id}</div>
            <div className="question-title flex-grow-1 mx-2">
              <Truncate
                lines={1}
                className={`question-title-card mb-0 ${
  !question.text ? 'text-gray-500' : ''
}`}
              >{question.text ? question.text : 'No text'}
              </Truncate>
            </div>

            <Dropdown data-testid="question-card-header__menu" onClick={() => { }}>
              <Dropdown.Toggle
                className="question-card-header__menu mx-3"
                                // id={`${namePrefix}-card-header__menu`}
                                // data-testid={`${namePrefix}-card-header__menu-button`}
                as={IconButton}
                src={MoreHoriz}
                alt="${namePrefix}-card-header__menu"
                iconAs={Icon}
              />
              <Dropdown.Menu>
                <Dropdown.Item className="font-weight-500 text-primary-500 small pl-3 py-2.5" data-testid="${namePrefix}-card-header__menu-move-up-button">
                  Move Up
                </Dropdown.Item>
                <Dropdown.Item className="font-weight-500 text-primary-500 small pl-3 py-2.5" data-testid="${namePrefix}-card-header__menu-move-down-button">
                  Move Down
                </Dropdown.Item>
                <Dropdown.Item className="border-top border-light font-weight-500 text-primary-500 small pl-3 py-2.5">
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Collapsible.Trigger className="collapsible-trigger d-flex align-items-center">
              <Collapsible.Visible whenClosed>
                <Icon src={KeyboardArrowDown} />
              </Collapsible.Visible>
              <Collapsible.Visible whenOpen>
                <Icon src={KeyboardArrowUp} />
              </Collapsible.Visible>
            </Collapsible.Trigger>
          </Collapsible.Advanced>
        </Card.Section>

        <Card.Section className="p-0">
          <Collapsible.Advanced open={isQuesetionCollapsibleOpen}>
            <Collapsible.Body className="collapsible-body border-top border-light">
              <QuestionWidget editorId={question.id} />
              <Card.Divider className="border-light-300" />
              <AnswerWidget problemType={problemType} />
              <Card.Divider className="border-light-300" />
              <ExplanationWidget editorId={question.id} />
            </Collapsible.Body>

          </Collapsible.Advanced>
        </Card.Section>
      </Card>
    </div>
  );
};

export { QuestionItem };
