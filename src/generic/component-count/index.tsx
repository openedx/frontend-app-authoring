import React from 'react';
import { Icon, Stack } from '@openedx/paragon';
import { Widgets } from '@openedx/paragon/icons';

type ComponentCountProps = {
  count?: number;
};

const ComponentCount: React.FC<ComponentCountProps> = ({ count }) => (
  count !== undefined ? (
    <Stack direction="horizontal" gap={1}>
      <Icon size="sm" src={Widgets} />
      <small>{count}</small>
    </Stack>
  ) : null
);

export default ComponentCount;
