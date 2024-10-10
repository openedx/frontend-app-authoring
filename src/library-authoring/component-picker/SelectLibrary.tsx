import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Card,
  Pagination,
  RadioControl,
  SearchField,
  Stack,
} from '@openedx/paragon';
import { useState } from 'react';

import Loading from '../../generic/Loading';
import AlertError from '../../generic/alert-error';
import { useContentLibraryV2List } from '../data/apiHooks';
import messages from './messages';

interface SelectLibraryProps {
  setSelectLibrary: (libraryKey: string) => void;
}

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

const SelectLibrary = ({ setSelectLibrary }: SelectLibraryProps) => {
  const intl = useIntl();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    <Stack gap={2}>
      <small className="text-primary-700">
        {intl.formatMessage(messages.selectLibraryInfo)}
      </small>
      <SearchField
        onSubmit={() => { }}
        onChange={handleSearch}
        value={searchQuery}
        placeholder={intl.formatMessage(messages.selectLibrarySearchPlaceholder)}
      />
      <div className="library-list">
        {data.results.length === 0 && (<EmptyState />)}
        {data.results.map((library) => (
          <Card key={library.id} className="card-item">
            <Card.Header
              size="sm"
              title={<span className="card-item-title">{library.title}</span>}
              subtitle={`${library.org} / ${library.slug}`}
              actions={(
                <RadioControl
                  name="select-library"
                  value={library.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectLibrary(e.target.value)}
                />
              )}
            />
            <Card.Body>
              <p>{library.description}</p>
            </Card.Body>
          </Card>
        ))}
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
