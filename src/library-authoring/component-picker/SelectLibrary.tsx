import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Card,
  Form,
  Pagination,
  SearchField,
  Stack,
} from '@openedx/paragon';
import { useState, useEffect } from 'react';

import Loading from '../../generic/Loading';
import AlertError from '../../generic/alert-error';
import { useContentLibraryV2List } from '../data/apiHooks';
import messages from './messages';

const EmptyState = () => (
  <Alert className="mt-4 align-self-center">
    <Alert.Heading>
      <FormattedMessage {...messages.selectLibraryEmptyStateTitle} />
    </Alert.Heading>
    <p>
      <FormattedMessage {...messages.selectLibraryEmptyStateMessage} />
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

  useEffect(() => {
    setSelectedLibrary('');
  }, [currentPage, searchQuery]);

  const handleSearch = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

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
    <Stack gap={5}>
      <small className="text-primary-700">
        {intl.formatMessage(messages.selectLibraryInfo)}
      </small>
      <SearchField
        onSubmit={handleSearch}
        onChange={handleSearch}
        value={searchQuery}
        placeholder={intl.formatMessage(messages.selectLibrarySearchPlaceholder)}
      />
      <div className="library-list">
        {data.results.length === 0 && (<EmptyState />)}
        <Form.RadioSet
          name="selected-library"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedLibrary(e.target.value)}
          value={selectedLibrary}
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
      </div>
      <Pagination
        paginationLabel={intl.formatMessage(messages.selectLibraryPaginationLabel)}
        pageCount={data!.numPages}
        currentPage={data!.currentPage}
        onPageSelect={(page: number) => setCurrentPage(page)}
        variant="secondary"
        className="align-self-center"
      />
    </Stack>
  );
};

export default SelectLibrary;
