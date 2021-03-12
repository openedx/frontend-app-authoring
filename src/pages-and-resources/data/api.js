/* eslint-disable import/prefer-default-export */
export function getPages() {
  return Promise.resolve({
    pages: [
      {
        id: 'discussions',
        title: 'Discussions',
        isEnabled: false,
        showSettings: false,
        showStatus: false,
        showEnable: true,
        description: 'Encourage participation and engagement in your course with discussion forums',
      },
      {
        id: 'teams',
        title: 'Teams',
        isEnabled: true,
        showSettings: true,
        showStatus: true,
        showEnable: false,
        description: 'Leverage teams to allow learners to connect by topic of interest',
      },
      {
        id: 'progress',
        title: 'Progress',
        isEnabled: false,
        showSettings: true,
        showStatus: true,
        showEnable: false,
        description: 'Allow students to track their progress throughout the course lorem ipsum',
      },
      {
        id: 'textbooks',
        title: 'Textbooks',
        isEnabled: true,
        showSettings: true,
        showStatus: true,
        showEnable: false,
        description: 'Provide links to applicable resources for your course',
      },
      {
        id: 'notes',
        title: 'Notes',
        isEnabled: true,
        showSettings: true,
        showStatus: true,
        showEnable: false,
        description: 'Support individual note taking that is visible only to the students',
      },
      {
        id: 'wiki',
        title: 'Wiki',
        isEnabled: false,
        showSettings: false,
        showStatus: false,
        showEnable: true,
        description: 'Share your wiki content to provide additional course material',
      },
    ],
  });
}
