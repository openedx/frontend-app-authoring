import React from 'react';
import { Card } from '@openedx/paragon';

const LibrarySection = ({ title, children } : { title: string, children: React.ReactNode }) => (
  <Card>
    <Card.Header
      title={title}
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

export default LibrarySection;
