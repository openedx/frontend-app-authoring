// Extract run from course ID (e.g., "course-v1:MITx+CS102+2025_T1" -> "2025_T1")
export const getCourseRunFromCourseId = (courseId: string | undefined | null) => {
  if (!courseId) {
    return null;
  }
  const parts = courseId.split('+');
  return parts[parts.length - 1];
};
