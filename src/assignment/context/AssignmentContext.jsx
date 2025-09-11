import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchAssignments } from '../data/assignmentService';
import messages from '../data/messages';

const AssignmentContext = createContext();

export const useAssignmentContext = () => useContext(AssignmentContext);

export const AssignmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [courseOptions, setCourseOptions] = useState(['all']);
  const [statusOptions, setStatusOptions] = useState(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [error, setError] = useState(null);

  const validateDateRange = (from, to) => {
    if (!from || !to) return true;
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    return toTime - fromTime <= threeMonths;
  };

  useEffect(() => {
    const loadData = async () => {
      if (fromDate && toDate && !validateDateRange(fromDate, toDate)) {
        setError(messages.errorInvalidDateRange);
        setAssignments([]);
        setTotalAssignments(0);
        setTotalPages(0);
        return;
      }
      try {
        const { data, total, totalPages, courseOptions, statusOptions } =
          await fetchAssignments({
            page: currentPage,
            pageSize,
            fromDate,
            toDate,
            course: courseFilter,
            status: statusFilter,
            searchQuery,
          });

        setAssignments(data);
        setTotalAssignments(total);
        setTotalPages(totalPages);
        setCourseOptions(courseOptions);
        setStatusOptions(statusOptions);
        setError(null);
      } catch (err) {
        setError(messages.errorLoad);
        setAssignments([]);
        setTotalAssignments(0);
        setTotalPages(0);
      }
    };
    loadData();
  }, [currentPage, fromDate, toDate, courseFilter, statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [courseFilter, statusFilter, searchQuery, fromDate, toDate]);

  const setToday = () => {
    const today = new Date();
    setFromDate(today);
    setToDate(today);
    setCurrentPage(1);
  };

  const setThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    setFromDate(startOfWeek);
    setToDate(endOfWeek);
    setCurrentPage(1);
  };

  const setThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setFromDate(startOfMonth);
    setToDate(endOfMonth);
    setCurrentPage(1);
  };

  const clearError = () => setError(null);

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        totalAssignments,
        totalPages,
        searchQuery,
        setSearchQuery,
        courseFilter,
        setCourseFilter,
        statusFilter,
        setStatusFilter,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        currentPage,
        setCurrentPage,
        courseOptions,
        statusOptions,
        setToday,
        setThisWeek,
        setThisMonth,
        error,
        clearError,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

AssignmentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
