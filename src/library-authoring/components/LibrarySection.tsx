/* eslint-disable react/require-default-props */
import React from 'react';
import { Card, ActionRow, Button } from '@openedx/paragon';

export const LIBRARY_SECTION_PREVIEW_LIMIT = 4;

const LibrarySection: React.FC<{
  title: string,
  viewAllAction?: () => void,
  contentCount: number,
  previewLimit?: number,
  children: React.ReactNode,
}> = ({
  title,
  viewAllAction,
  contentCount,
  previewLimit = LIBRARY_SECTION_PREVIEW_LIMIT,
  children,
}) => (
  <Card>
    <Card.Header
      title={title}
      actions={
        viewAllAction
        && contentCount > previewLimit
        && (
          <ActionRow>
            <Button variant="tertiary" onClick={viewAllAction}>View All</Button>
          </ActionRow>
        )
      }
    />
    <Card.Section>
      {children}
    </Card.Section>
  </Card>
);

export default LibrarySection;
