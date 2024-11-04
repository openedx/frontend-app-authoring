import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Card,
  Form,
  Pagination,
  SearchField,
  Stack,
} from '@openedx/paragon';
import { useCallback, useState } from 'react';

import Loading from '../../generic/Loading';
import AlertError from '../../generic/alert-error';
import { useContentLibraryV2List } from '../data/apiHooks';
import messages from './messages';

interface EmptyStateProps {
  hasSearchQuery: boolean;
}

const EmptyState = ({ hasSearchQuery }: EmptyStateProps) => (
  <Alert className="mt-4 align-self-center">
    <Alert.Heading>
      {hasSearchQuery ? (
        <FormattedMessage {...messages.selectLibraryNoSearchResultsTitle} />
      ) : (
        <FormattedMessage {...messages.selectLibraryNoLibrariesTitle} />
      )}
    </Alert.Heading>
    <p>
      {hasSearchQuery ? (
        <FormattedMessage {...messages.selectLibraryNoSearchResultsMessage} />
      ) : (
        <FormattedMessage {...messages.selectLibraryNoLibrariesMessage} />
      )}
    </p>
  </Alert>
);

interface SelectLibraryProps {
  selectedLibrary: string;
  setSelectedLibrary: (libraryKey: string) => void;
}

const SelectLibrary = ({ selectedLibrary, setSelectedLibrary }: SelectLibraryProps) => {
  const intl = useIntl();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = useCallback((search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useContentLibraryV2List({
    page: currentPage,
    pageSize: 5,
    search: searchQuery,
  });

  if (isError) {
    return <AlertError error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Stack gap={2} className="p-5">
      <small className="text-primary-700">
        {intl.formatMessage(messages.selectLibraryInfo)}
      </small>
      <SearchField
        onSubmit={handleSearch}
        onChange={handleSearch}
        value={searchQuery}
        placeholder={intl.formatMessage(messages.selectLibrarySearchPlaceholder)}
      />
      {data.results.length === 0 ? (<EmptyState hasSearchQuery={!!searchQuery} />) : (
        <>
          <Form.RadioSet
            name="selected-library"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedLibrary(e.target.value)}
            value={selectedLibrary}
            className="mt-4"
          >
            {data.results.map((library) => (
              <Card
                key={library.id}
                isClickable
                onClick={() => setSelectedLibrary(library.id)}
                className="card-item"
              >
                <Card.Header
                  size="sm"
                  title={<span className="card-item-title">{library.title}</span>}
                  subtitle={`${library.org} / ${library.slug}`}
                  actions={(
                    <Form.Radio value={library.id} name={`select-library-${library.id}`}>{' '}</Form.Radio>
                  )}
                />
                <Card.Body>
                  <p>{library.description}</p>
                </Card.Body>
              </Card>
            ))}
          </Form.RadioSet>
          <Pagination
            paginationLabel={intl.formatMessage(messages.selectLibraryPaginationLabel)}
            pageCount={data!.numPages}
            currentPage={data!.currentPage}
            onPageSelect={setCurrentPage}
            variant="secondary"
            className="align-self-center"
          />
        </>
      )}
    </Stack>
  );
};

export default SelectLibrary;
