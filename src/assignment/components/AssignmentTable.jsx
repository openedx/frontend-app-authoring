import React from 'react';
import { DataTable, IconButton, Icon } from '@openedx/paragon';
import { OpenInNew } from '@openedx/paragon/icons'; 
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAssignmentContext } from '../context/AssignmentContext';
import messages from '../data/messages';

const AssignmentTable = () => {
  const intl = useIntl();
  const { assignments } = useAssignmentContext();

  const columns = [
    { Header: intl.formatMessage(messages.tableHeaders.assignmentName), accessor: 'assignmentName' },
    { Header: intl.formatMessage(messages.tableHeaders.courseName), accessor: 'courseName' },
    { Header: intl.formatMessage(messages.tableHeaders.unitName), accessor: 'unitName' },
    { Header: intl.formatMessage(messages.tableHeaders.dueDate), accessor: 'dueDate' },
    { Header: intl.formatMessage(messages.tableHeaders.responses), accessor: 'responses' },
    { Header: intl.formatMessage(messages.tableHeaders.marks), accessor: 'marks' },
    { Header: intl.formatMessage(messages.tableHeaders.status), accessor: 'status' },
    {
      Header: intl.formatMessage(messages.tableHeaders.review),
      accessor: 'review',
      Cell: ({ value }) => (
        <IconButton
          iconAs={Icon} 
          src={OpenInNew}
          title={intl.formatMessage(messages.openReview)}
          aria-label={intl.formatMessage(messages.openReview)}
          size="sm"
          variant="tertiary"
          onClick={() => window.open(value, '_blank')} 
        />
      ),
    },
  ];

  return <DataTable data={assignments} columns={columns} />;
};

export default AssignmentTable;
