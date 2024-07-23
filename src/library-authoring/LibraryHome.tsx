import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Card, Stack,
} from '@openedx/paragon';

import { useSearchContext } from '../search-manager';
import { NoComponents, NoSearchResults } from './EmptyStates';
import LibraryCollections from './LibraryCollections';
import { LibraryComponents } from './components';
import messages from './messages';

const Section = ({ title, children } : { title: string, children: React.ReactNode }) => (
  <Card>
    <Card.Header
      title={title}
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

type LibraryHomeProps = {
  libraryId: string,
};

const LibraryHome = ({ libraryId } : LibraryHomeProps) => {
  const intl = useIntl();

  const {
    totalHits: componentCount,
    searchKeywords,
  } = useSearchContext();

  const collectionCount = 0;

  if (componentCount === 0) {
    return searchKeywords === '' ? <NoComponents /> : <NoSearchResults />;
  }

  return (
    <Stack gap={3}>
      <Section title={intl.formatMessage(messages.recentlyModifiedTitle)}>
        { intl.formatMessage(messages.recentComponentsTempPlaceholder) }
      </Section>
      <Section title={intl.formatMessage(messages.collectionsTitle, { collectionCount })}>
        <LibraryCollections />
      </Section>
      <Section title={`Components (${componentCount})`}>
        <LibraryComponents libraryId={libraryId} variant="preview" />
      </Section>
    </Stack>
  );
};

export default LibraryHome;
