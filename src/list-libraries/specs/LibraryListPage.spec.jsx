import React from 'react';
import update from 'immutability-helper';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { ctxMount } from '@src/library-authoring/common/specs/helpers';
import { libraryFactory } from '@src/library-authoring/common/specs/factories';
import { LOADING_STATUS, ROUTES } from '@src/library-authoring/common';
import { LibraryListPage } from '../LibraryListPage';
import { libraryListInitialState } from '../data';
import { withNavigate } from '../../utils/hoc';

const mockNavigate = jest.fn();
const InjectedLibraryListPage = injectIntl(withNavigate(LibraryListPage));
const config = { STUDIO_BASE_URL: 'STUDIO_BASE_URL' };
const mockLibraryFetcher = jest.fn();
const props = {
  ...libraryListInitialState,
  fetchLibraryList: mockLibraryFetcher,
  status: LOADING_STATUS.LOADED,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('list-libraries/LibraryListPage.jsx', () => {
  afterEach(() => {
    mockLibraryFetcher.mockReset();
  });

  it('renders library list page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );
  });

  it('renders library list page with loading', () => {
    const newProps = update(props, {
      status: { $set: LOADING_STATUS.LOADING },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const loading = container.find('.spinner-border');
    expect(loading.exists()).toBeTruthy();
  });

  it('renders library list page with error', () => {
    const errorMessage = 'mock error message';

    const newProps = update(props, {
      status: { $set: LOADING_STATUS.FAILED },
      errorMessage: { $set: 'mock error message' },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    expect(container.childAt(0).text()).toEqual(`Error: ${errorMessage}`);
  });

  it('fetches library list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(mockLibraryFetcher).toHaveBeenCalledWith({
      params: {
        org: '',
        page: 1,
        page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE,
        text_search: '',
        type: 'complex',
      },
    });
  });

  it('shows no pagination for empty library list', () => {
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    expect(container.find('.library-list-pagination').length).toBe(0);
  });

  it('Paginates on big library list', () => {
    const newProps = update(props, {
      libraries: { count: { $set: 150 } },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const paginationContainer = container.find('.library-list-pagination').at(1);
    expect(paginationContainer).toBeTruthy();

    const previousButton = paginationContainer.find('.previous.page-link').at(1);
    expect(previousButton).toBeTruthy();

    const nextButton = paginationContainer.find('.next.page-link').at(1);
    expect(nextButton).toBeTruthy();

    nextButton.simulate('click');
    nextButton.simulate('click');
    previousButton.simulate('click');
    previousButton.simulate('click');
    const commonParams = {
      org: '', page_size: +process.env.LIBRARY_LISTING_PAGINATION_PAGE_SIZE, text_search: '', type: 'complex',
    };
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(1, { params: { ...commonParams, page: 1 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(2, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(3, { params: { ...commonParams, page: 3 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(4, { params: { ...commonParams, page: 2 } });
    expect(mockLibraryFetcher).toHaveBeenNthCalledWith(5, { params: { ...commonParams, page: 1 } });
  });

  it('shows empty page for empty library list', () => {
    const newProps = update(props, {
      libraries: { count: { $set: 0 } },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    expect(container.find('.library-list .library-item').length).toBe(0);

    const emptyHeadingText = container.find('h2').text();
    expect(emptyHeadingText).toEqual('Add your first library to get started');
  });

  it('shows the create form when clicking the new library button on a empty page', () => {
    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
      { config },
    );

    const emptyPage = container.find('.pgn__card.horizontal');
    expect(emptyPage).toBeTruthy();

    const newLibraryButton = emptyPage.find('button.btn-outline-primary');
    newLibraryButton.simulate('click');

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.CREATE);
  });

  it('handle click on library listing item', () => {
    const library = libraryFactory();
    const newProps = update(props, {
      libraries: {
        data: { $push: [{ ...library }] },
        count: { $set: 1 },
      },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const libraryItem = container.find('.library-item').at(0);
    libraryItem.simulate('click');

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('handle click create library page', () => {
    const library = libraryFactory();
    const newProps = update(props, {
      libraries: {
        data: { $push: [{ ...library }] },
        count: { $set: 1 },
      },
    });

    const container = ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...newProps} />
      </BrowserRouter>,
      { config },
    );

    const newLibraryBtn = container.find('button.btn-primary').at(0);
    newLibraryBtn.simulate('click');

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.List.CREATE);
  });
});
