import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { QuestionItem } from './QuestionItem';

// import './index.scss';
// import messages from './messages';

const BasicProblemEditor = ({ problemType }) => {
  const [questionList, setQuestionList] = useState([
    {
      id: 1,
      text: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Numquam odit aliquid veniam corrupti cupiditate quisquam assumenda quo autem ea? Ipsa aliquam id repudiandae quos, facilis illum odit possimus consequatur cum?',
    },
    {
      id: 2,
      text: '',
    },
    {
      id: 3,
      text: "What's the color of sky?",
    },
  ]);
  const [isQuesetionCollapsibleOpen, setIsQuestionCollapsibleOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleCollapsibleOpen = () => setIsQuestionCollapsibleOpen(!isQuesetionCollapsibleOpen);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) { return; }

    const oldIndex = questionList.findIndex((q) => q.id === active.id);
    const newIndex = questionList.findIndex((q) => q.id === over.id);
    console.log({ oldIndex, newIndex });

    const updatedQuestions = [...questionList];
    const [movedItem] = updatedQuestions.splice(oldIndex, 1);
    updatedQuestions.splice(newIndex, 0, movedItem);

    setQuestionList(updatedQuestions);
  };

  return (
    <div>
      <div className="font-weight-bold text-primary-500 mb-3">Questions</div>
      <DndContext
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >

        <SortableContext
          id="root-questions-list"
          items={questionList}
          strategy={verticalListSortingStrategy}
        >
          {questionList.map((question, key) => (
            <QuestionItem
              key={question.id}
              question={question}
              isQuesetionCollapsibleOpen={isQuesetionCollapsibleOpen}
              toggleCollapsibleOpen={toggleCollapsibleOpen}
              problemType={problemType}
            />
          ))}
        </SortableContext>
      </DndContext>

    </div>
  );
};

export default BasicProblemEditor;
