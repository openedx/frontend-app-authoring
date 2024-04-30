import {
  reducer,
  fetchTextbooks,
  updateLoadingStatus,
  updateSavingStatus,
  createTextbookSuccess,
  editTextbookSuccess,
  deleteTextbookSuccess,
} from './slice';

const initialState = {
  savingStatus: '',
  loadingStatus: 'IN_PROGRESS',
  textbooks: [],
  currentTextbookId: '',
};

const textbooks = [
  {
    tabTitle: 'Textbook Name 1',
    chapters: [
      {
        title: 'Chapter 1',
        url: '/static/Present-Perfect.pdf',
      },
      {
        title: 'Chapter 2',
        url: '/static/Present-Simple.pdf',
      },
    ],
    id: '1',
  },
  {
    tabTitle: 'Textbook Name 2',
    chapters: [
      {
        title: 'Chapter 1',
        url: '/static/Present-Perfect.pdf',
      },
    ],
    id: '2',
  },
];

describe('textbooks slice', () => {
  it('should handle fetchTextbooks', () => {
    const nextState = reducer(initialState, fetchTextbooks({ textbooks }));

    expect(nextState.textbooks).toEqual(textbooks);
  });

  it('should handle updateLoadingStatus', () => {
    const nextState = reducer(initialState, updateLoadingStatus({ status: 'SUCCESS' }));

    expect(nextState.loadingStatus).toEqual('SUCCESS');
  });

  it('should handle updateSavingStatus', () => {
    const nextState = reducer(initialState, updateSavingStatus({ status: 'ERROR' }));

    expect(nextState.savingStatus).toEqual('ERROR');
  });

  it('should handle createTextbookSuccess', () => {
    const newTextbook = {
      tabTitle: 'New Textbook',
      chapters: [
        {
          title: 'Chapter 1',
          url: '/static/New-Textbook-Chapter-1.pdf',
        },
      ],
      id: '3',
    };
    const nextState = reducer(initialState, createTextbookSuccess(newTextbook));

    expect(nextState.textbooks).toContainEqual(newTextbook);
  });

  it('should handle editTextbookSuccess', () => {
    const newInitialState = {
      savingStatus: '',
      loadingStatus: 'IN_PROGRESS',
      textbooks,
      currentTextbookId: '',
    };
    const editedTextbook = {
      tabTitle: 'Edited Textbook Name 1',
      chapters: [
        {
          title: 'Chapter 1',
          url: '/static/Edited-Chapter-1.pdf',
        },
        {
          title: 'Chapter 2',
          url: '/static/Edited-Chapter-2.pdf',
        },
      ],
      id: '1',
    };
    const nextState = reducer(newInitialState, editTextbookSuccess(editedTextbook));

    expect(nextState.textbooks).toContainEqual(editedTextbook);
  });

  it('should handle deleteTextbookSuccess', () => {
    const newInitialState = {
      savingStatus: '',
      loadingStatus: 'IN_PROGRESS',
      textbooks,
      currentTextbookId: '',
    };
    const textbookIdToDelete = '1';
    const nextState = reducer(newInitialState, deleteTextbookSuccess(textbookIdToDelete));

    expect(nextState.textbooks.some((textbook) => textbook.id === textbookIdToDelete)).toBe(false);
  });
});
