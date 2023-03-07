/* eslint-disable */

import React, { createContext, useState, useEffect, useContext } from 'react';
import './KeyTermsDashboard.scss';

import {
  Collapsible,
  Button,
  Container,
  Icon,
  ActionRow,
  SearchField,
  IconButton,
  Pagination,
} from '@edx/paragon';

import { Delete, Edit, ExpandLess, ExpandMore } from '@edx/paragon/icons';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import EditKeyTerm from './Pages/EditKeyTerm';
import Sidebar from './Sidebar';

export const CourseContext = createContext();
export const KeyTermContext = createContext();
const ListViewContext = createContext();
const paginationLength = 15;

function ResourceList() {
  const { resources } = useContext(KeyTermContext);
  return (
    <div className="ref-container flex-col">
      <b>References:</b>
      {resources.map((resource) => (
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={resource.resource_link}
          >
            {resource.friendly_name}
          </a>
        </p>
      ))}
    </div>
  );
}

function Lessons() {
  const { lessons } = useContext(KeyTermContext);

  // Sorting list by module name then by lesson name
  lessons.sort((a, b) =>
    a.module_name === b.module_name
      ? a.lesson_name > b.lesson_name
        ? 1
        : -1
      : a.module_name > b.module_name
      ? 1
      : -1
  );

  return (
    <div className="lessons-container flex-col">
      <b>Lessons</b>
      {lessons.map((lesson) => (
        <Lesson key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}

// Gets a specific lesson
function Lesson({ lesson }) {
  const { courseId } = useContext(CourseContext);
  const encodedCourse = courseId.replace(' ', '+');
  return (
    <p>
      <a key={lesson.id} target="_blank" rel="noopener noreferrer" href={`${process.env.CMS_BASE_URL}/container/${lesson.lesson_link}`}> {lesson.module_name}&gt;{lesson.lesson_name}&gt;{lesson.unit_name}</a> &nbsp; &nbsp;
    </p>
  );
}

function Textbook({ textbook }) {
  const [variant, setVariant] = useState('primary');
  const [buttonText, setButtonText] = useState('Copy Link');

  const { courseId } = useContext(CourseContext);
  const assetId = courseId.replace('course', 'asset');

  const lmsTextbookLink = `${getConfig().LMS_BASE_URL}/${assetId}+type@asset+block@${textbook.textbook_link}#page=${textbook.page_num}`;

  return (
    <p>
      {textbook.chapter} pg. {textbook.page_num} &nbsp; &nbsp;
      <Button
        variant={variant}
        size="inline"
        title="Copy Link"
        onClick={() => {
          navigator.clipboard.writeText(lmsTextbookLink);
          setVariant('light');
          setButtonText('Copied');
        }}
      >
        {' '}
        {buttonText}{' '}
      </Button>
    </p>
  );
}

function TextbookList() {
  const { textbooks } = useContext(KeyTermContext);
  return (
    <div className='textbook-container flex-col'>
      <b>Textbooks</b>
      {textbooks.map((textbook) => (
        <Textbook key={textbook.id} textbook={textbook} />
      ))}
    </div>
  );
}

function DefinitionsList() {
  const { definitions } = useContext(KeyTermContext);
  return (
    <div className='definitions-container flex-col'>
      <b>Definitions</b>
      {definitions.map((descr) => (
        <div className='definition'>
          <p>{descr.description}</p>
        </div>
      ))}
    </div>
  );
}

function KeyTermData() {
  return (
    <div className='key-term-info'>
      <DefinitionsList />
      <TextbookList />
      <Lessons />
      <ResourceList />
    </div>
  );
}

function KeyTerm({index}) {
  const { key_name } = useContext(KeyTermContext);
  const { courseId, setUpdate } = useContext(CourseContext);
  const [editTermModal, setEditTermModal] = useState(false);

  async function DeleteKeyTerm() {
    const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/key_term/`;
    const course = courseId.replaceAll('+', ' ');
    const termToDelete = {
      key_name: key_name,
      course_id: course,
    };

    if (
      window.confirm(
        `Are you sure you want to remove key term ${key_name} from this course?`
      )
    ) {
      const response = await fetch(restUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(termToDelete),
      })
        .then((data) => {
          console.log('Success:', data);
          console.log(JSON.stringify(termToDelete));
          setUpdate(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      return response;
    }
  }

  return (
    <div className='key-term-container'>
      <Collapsible
        style={
          index % 2
            ? { backgroundColor: '#d4d4d4' }
            : { backgroundColor: 'white' }
        }
        title={<b>{key_name}</b>}
        styling='card-lg'
        iconWhenOpen={<Icon src={ExpandLess} />}
        iconWhenClosed={<Icon src={ExpandMore} />}
      >
        <span>
          <EditKeyTerm
            modalOpen={editTermModal}
            setModalOpen={setEditTermModal}
            courseId={courseId}
            // keyTerm={keyTerm}
          />
          <IconButton
            src={Edit}
            iconAs={Icon}
            alt='Edit'
            variant='secondary'
            size='sm'
            onClick={() => {
              setEditTermModal(true);
            }}
          />
          <IconButton
            src={Delete}
            iconAs={Icon}
            alt='Delete'
            variant='secondary'
            size='sm'
            onClick={() => {
              DeleteKeyTerm();
            }}
          />
        </span>
        <KeyTermData />
      </Collapsible>
    </div>
  );
}

function KeyTermList() {
  const { searchQuery, selectedPage, setPagination } =
    useContext(ListViewContext);
  const { courseId, termData, setTermData, update, setUpdate } = useContext(CourseContext);

  function paginate(termList, page_size, page_number) {
    return termList.slice(
      (page_number - 1) * page_size,
      page_number * page_size
    );
  }

  const restUrl = `${process.env.KEYTERMS_API_BASE_URL}/api/v1/course_terms?course_id=${courseId}`;

  useEffect(() => {
    fetch(restUrl)
      .then((response) => response.json())
      .then((jsonData) => {
        // jsonData is parsed json object received from url
        setTermData(jsonData);
      })
      .catch((error) => {
        // handle your errors here
        console.error(error);
      });
  }, [setTermData, update]);

  const displayTerms = termData
    .filter(
      (keyTerm) =>
        keyTerm.key_name
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        keyTerm.definitions.find((object) =>
          object.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) !== undefined
    )
    .sort((a, b) => {
      if (a.key_name < b.key_name) {
        return -1;
      }
      if (a.key_name > b.key_name) {
        return 1;
      }
      return 0;
    });

  if (displayTerms.length === 0) {
    setPagination(0);
  } else {
    setPagination(displayTerms.length / paginationLength);
  }

  return (
    <div className='key-term_list'>
      {displayTerms.length === 0 ? (
        <h3 className='filter-container'>No Terms to Display...</h3>
      ) : null}
      {paginate(displayTerms, paginationLength, selectedPage).map(
        (keyTerm, index) => (
          <KeyTermContext.Provider value={keyTerm}>
            <KeyTerm index={index} key={keyTerm.id} />
          </KeyTermContext.Provider>
        )
      )}
    </div>
  );
}

function KeyTermsDashboard({ courseId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [termData, setTermData] = useState([]);
  const [update, setUpdate] = useState('');
  const [selectedPage, setSelectedPage] = useState(1);
  const [pagination, setPagination] = useState();
  const [expandAll, setExpandAll] = useState(false);

  return (
    <CourseContext.Provider value={{ courseId, termData, setTermData, update, setUpdate }}>
      <Container size='xl'>
        <div className='header'>
          <h2 className='mt-3 mb-2'>Studio: Key Term Dashboard</h2>
          <hr />
        </div>
        <div className='dashboard-container'>
          <Sidebar />
          <div className='key-term-list-container'>
            <div className='menu-bar'>
              <ActionRow>
                <p>
                  Displaying{' '}
                  {pagination > 0
                    ? 1 + paginationLength * (selectedPage - 1)
                    : 0}
                  -
                  {pagination * paginationLength < paginationLength
                    ? parseInt(pagination * paginationLength)
                    : paginationLength * selectedPage}{' '}
                  of {parseInt(pagination * paginationLength)} items
                </p>
                {/* <p>
                <a
                  onClick={() => {
                  setExpandAll(!expandAll);
                  console.log(expandAll)}}
                >
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </a>
                </p> */}
                <ActionRow.Spacer />
                <SearchField
                  onSubmit={(value) => {
                    setSearchQuery(value);
                  }}
                  onClear={() => setSearchQuery('')}
                  placeholder='Search'
                />
              </ActionRow>
            </div>
            <ListViewContext.Provider
              value={{
                searchQuery,
                selectedPage,
                setPagination,
                expandAll,
                setExpandAll,
              }}
            >
              <KeyTermList />
            </ListViewContext.Provider>
            <div className='footer-container'>
              {pagination === 0 ? null : (
                <Pagination
                  paginationLabel='pagination navigation'
                  pageCount={
                    pagination > parseInt(pagination)
                      ? parseInt(pagination) + 1
                      : pagination
                  }
                  onPageSelect={(value) => setSelectedPage(value)}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </CourseContext.Provider>
  );
}

export default injectIntl(KeyTermsDashboard);
// export default KeyTermsDashboard;
