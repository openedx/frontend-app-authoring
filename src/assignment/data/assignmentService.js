import assignmentsData from './assignments.json';

export const fetchAssignments = async ({
  page = 1,
  fromDate,
  toDate,
  course,
  status,
  searchQuery,
  pageSize = 15,
}) => {
  try {
  
    const courseOptions = ['all', ...new Set(assignmentsData.map(a => a.courseName))];
    const statusOptions = ['all', ...new Set(assignmentsData.map(a => a.status))];

 
    let result = filterAssignments(assignmentsData, { course, status, fromDate, toDate });

 
    result = searchAssignments(result, searchQuery);

  
    const start = (page - 1) * pageSize;
    const paginatedData = result.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total: result.length,
      totalPages: Math.ceil(result.length / pageSize),
      courseOptions,
      statusOptions,
    };
  } catch (error) {
    throw new Error('Failed to fetch assignments');
  }
};

export const filterAssignments = (assignments, { course, status, fromDate, toDate }) => {
  return assignments.filter(assignment => {
    let matches = true;
    if (course && course !== 'all' && assignment.courseName !== course) matches = false;
    if (status && status !== 'all' && assignment.status !== status) matches = false;
    if (fromDate && toDate) {
      const due = new Date(assignment.dueDate);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (due < from || due > to) matches = false;
    }
    return matches;
  });
};

export const searchAssignments = (assignments, query) => {
  if (!query) return assignments;
  const q = query.toLowerCase();
  return assignments.filter(assignment =>
    Object.values(assignment).some(value =>
      value && value.toString().toLowerCase().includes(q)
    )
  );
};
