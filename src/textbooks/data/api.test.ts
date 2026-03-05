import { initializeMocks } from '@src/testUtils';

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
      .reply(200, textbooksMock);
  });

  it('should fetch textbooks for a course', async () => {
    const textbooksData = [{ id: 1, title: 'Textbook 1' }, { id: 2, title: 'Textbook 2' }];
    axiosMock.onGet(getTextbooksApiUrl(courseId)).reply(200, textbooksData);

    const result = await getTextbooks(courseId);

    expect(result).toEqual(textbooksData);
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
