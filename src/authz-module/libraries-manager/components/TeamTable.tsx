import {
  DataTable, Button, Chip, Skeleton,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useMemo } from 'react';
import { TableCellValue, TeamMember } from '@src/authz-module/constants';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useTeamMembers } from '../data/hooks';
import { useLibraryAuthZ } from '../context';

const SKELETON_ROWS = Array.from({ length: 10 }).map(() => ({
  username: 'skeleton',
  name: '',
  email: '',
  roles: [],
}));

type CellProps = TableCellValue<TeamMember>;

const EmailCell = ({ row }: CellProps) => (row.original?.username === SKELETON_ROWS[0].username ? (
  <Skeleton width="180px" />
) : (
  row.original.email
));

const NameCell = ({ row }: CellProps) => (row.original.username === SKELETON_ROWS[0].username ? (
  <Skeleton width="180px" />
) : (
  row.original.name
));

const RolesCell = ({ row }: CellProps) => (row.original.username === SKELETON_ROWS[0].username ? (
  <Skeleton width="80px" />
) : (
  row.original.roles.map((role) => (
    <Chip key={`${row.original.username}-role-${role}`}>{role}</Chip>
  ))
));

const TeamTable = () => {
  const { libraryId, canManageTeam, username } = useLibraryAuthZ();
  const {
    data: teamMembers, isLoading,
  } = useTeamMembers(libraryId);
  const rows = teamMembers || SKELETON_ROWS;
  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: NameCell,
    },
    {
      Header: 'Email',
      accessor: 'email',
      Cell: EmailCell,
    },
    {
      Header: 'Roles',
      accessor: 'roles',
      Cell: RolesCell,
    },
  ], [isLoading]);

  return (
    <DataTable
      isPaginated
      data={rows}
      itemCount={rows?.length}
      additionalColumns={[
        {
          id: 'action',
          Header: 'Actions',
          // eslint-disable-next-line react/no-unstable-nested-components
          Cell: ({ row }: CellProps) => (
            canManageTeam && row.original.username !== username && !isLoading ? (
              <Button
                iconBefore={Edit}
                variant="link"
                size="sm"
                onClick={() => { }}
              ><FormattedMessage
                id="authz.libraries.team.table.action"
                defaultMessage="Edit"
                description="Edit action"
              />
              </Button>
            ) : null),
        },
      ]}
      initialState={{
        pageSize: 10,
      }}
      columns={columns}
    />
  );
};

export default TeamTable;
