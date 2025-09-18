import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Pagination } from '@openedx/paragon';
import '../assets/styles/_assignment.scss';
import { AssignmentProvider } from '../context/AssignmentContext';
import SearchInput from '../components/SearchInput';
import DateFilter from '../components/DateFilter';
import AssignmentTable from '../components/AssignmentTable';
import ErrorDisplay from '../components/ErrorDisplay';
import messages from '../data/messages';
import { useAssignmentContext } from '../context/AssignmentContext';
import CustomFilterDropdown from '../components/CustomFilterDropdown';

const AssignmentPageContent = () => {
  const intl = useIntl();
  const {
    courseFilter,
    setCourseFilter,
    statusFilter,
    setStatusFilter,
    courseOptions,
    statusOptions,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useAssignmentContext();

  return (
    <div className="assignment-page">
      <ErrorDisplay />
      <div className="header">
        <div className="top-row">
          <h2>{intl.formatMessage(messages.pageTitle)}</h2>
          <div className="datefilterItem1">
            <DateFilter />
          </div>
        </div>
        <div className="filters">
          <div className="datefilterItem2">
            <DateFilter />
          </div>
          <div className="searchInputItem">
            <SearchInput />
          </div>
          <div className="inputfilterContainer">
            <div className="customFilterDropdownItem1">
              <CustomFilterDropdown
                value={courseFilter}
                onChange={(val) => setCourseFilter(val)}
                options={courseOptions}
                allLabelMessage={messages.allCourses}
              />
            </div>
            <div className="customFilterDropdownItem2">
              <CustomFilterDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={statusOptions}
                allLabelMessage={messages.allStatus}
                showSearch={false}
              />
            </div>
          </div>
        </div>
      </div>


      <div className="table-row">
        <AssignmentTable />
      </div>
      <div className="pagination-row">
        <Pagination
          currentPage={currentPage}
          paginationLabel="assignment pagination"
          pageCount={totalPages}
          onPageSelect={setCurrentPage}
        />
      </div>
    </div>
  );
};

const AssignmentPage = () => (
  <AssignmentProvider>
    <AssignmentPageContent />
  </AssignmentProvider>
);

export default AssignmentPage;