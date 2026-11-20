import { initializeMocks } from '@src/testUtils';
import { paginatedListPage } from '@src/generic/data/paginatedList';

import { textbooksMock } from 'CourseAuthoring/textbooks/__mocks__';
import {
  getTextbooks,
  createTextbook,
  editTextbook,
  deleteTextbook,
  getTextbooksApiUrl,
  getUpdateTextbooksApiUrl,
  getEditTextbooksApiUrl,
} from './api';

let axiosMock;
const courseId = 'course-v1:org+101+101';

describe('getTextbooks', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();

    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, paginatedListPage(textbooksMock.textbooks));
  });

  it('should fetch textbooks for a course', async () => {
    const result = await getTextbooks(courseId);

    expect(result).toEqual(textbooksMock);
    expect(axiosMock.history.get[0].url).toEqual(
      'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/textbooks/',
    );
  });

  it('should return the textbooks of every page, in order', async () => {
    const [first, second] = textbooksMock.textbooks;
    axiosMock
      .onGet(getTextbooksApiUrl(courseId), { params: { page: 1, page_size: 100 } })
      .reply(200, paginatedListPage([first], { page: 1, numPages: 2 }))
      .onGet(getTextbooksApiUrl(courseId), { params: { page: 2, page_size: 100 } })
      .reply(200, paginatedListPage([second], { page: 2, numPages: 2 }));

    const result = await getTextbooks(courseId);

    expect(result).toEqual({ textbooks: [first, second] });
  });

  it('should convert the server\'s snake_case keys', async () => {
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, paginatedListPage([{ id: '1', tab_title: 'Textbook', chapters: [] }]));

    const result = await getTextbooks(courseId);

    expect(result).toEqual({ textbooks: [{ id: '1', tabTitle: 'Textbook', chapters: [] }] });
  });
});

describe('createTextbook', () => {
  it('should create a new textbook for a course', async () => {
    const textbookData = { tabTitle: 'New Textbook', chapters: [] };
    axiosMock.onPost(getUpdateTextbooksApiUrl(courseId)).reply(200, textbookData);

    const result = await createTextbook(courseId, textbookData);

    expect(result).toEqual(textbookData);
  });
});

describe('editTextbook', () => {
  it('should edit an existing textbook for a course', async () => {
    const textbookId = '1';
    const editedTextbookData = { id: '1', tabTitle: 'Edited Textbook', chapters: [] };
    axiosMock.onPut(getEditTextbooksApiUrl(courseId, textbookId)).reply(200, editedTextbookData);

    const result = await editTextbook(courseId, editedTextbookData);

    expect(result).toEqual(editedTextbookData);
  });
});

describe('deleteTextbook', () => {
  it('should delete an existing textbook for a course', async () => {
    const textbookId = '1';
    axiosMock.onDelete(getEditTextbooksApiUrl(courseId, textbookId)).reply(200, {});

    await expect(deleteTextbook(courseId, textbookId)).resolves.toBeUndefined();
  });
});
