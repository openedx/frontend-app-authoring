import React from 'react';
import { Router, withRouter } from 'react-router';
import update from 'immutability-helper';
import { BrowserRouter } from 'react-router-dom';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { createMemoryHistory } from 'history';
import { LibraryListPage } from '../LibraryListPage';
import { libraryListInitialState } from '../data';
import { LOADING_STATUS, ROUTES } from '../../common';
import { ctxMount } from '../../common/specs/helpers';
import { libraryFactory } from '../../common/specs/factories';

const InjectedLibraryListPage = injectIntl(withRouter(LibraryListPage));
const history = createMemoryHistory();
const historySpy = jest.spyOn(history, 'push');
const mockLibraryFetcher = jest.fn();
const props = {
  ...libraryListInitialState,
  fetchLibraryList: mockLibraryFetcher,
  status: LOADING_STATUS.LOADED,
};

describe('list-libraries/LibraryListPage.jsx', () => {
  afterEach(() => {
    mockLibraryFetcher.mockReset();
  });

  it('renders library list page without error', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
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
    );

    expect(container.childAt(0).text()).toEqual(`Error: ${errorMessage}`);
  });

  it('fetches library list on mount', () => {
    ctxMount(
      <BrowserRouter>
        <InjectedLibraryListPage {...props} />
      </BrowserRouter>,
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
    );

    expect(container.find('.library-list .library-item').length).toBe(0);
    expect(container.find('.empty-sheet-wrapper').exists()).toBeTruthy();

    const emptyHeadingText = container.find('.h3').text();
    expect(emptyHeadingText).toEqual('Add your first library to get started');
  });

  it('shows the create form when clicking the new library button on a empty page', () => {
    const container = ctxMount(
      <BrowserRouter>
        <Router history={history}>
          <InjectedLibraryListPage {...props} />
        </Router>
      </BrowserRouter>,
    );

    const emptyPage = container.find('.empty-sheet-wrapper');
    expect(emptyPage).toBeTruthy();

    const newLibraryButton = emptyPage.find('button.btn-outline-primary.btn-lg');
    newLibraryButton.simulate('click');

    expect(historySpy).toHaveBeenCalledWith(ROUTES.List.CREATE);
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
        <Router history={history}>
          <InjectedLibraryListPage {...newProps} />
        </Router>
      </BrowserRouter>,
    );

    const libraryItem = container.find('.library-item').at(0);
    libraryItem.simulate('click');

    expect(historySpy).toHaveBeenCalled();
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
        <Router history={history}>
          <InjectedLibraryListPage {...newProps} />
        </Router>
      </BrowserRouter>,
    );

    const newLibraryBtn = container.find('button.btn-outline-primary').at(0);
    newLibraryBtn.simulate('click');

    expect(historySpy).toHaveBeenCalledWith(ROUTES.List.CREATE);
  });
});
