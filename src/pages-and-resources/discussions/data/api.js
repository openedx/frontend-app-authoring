/* eslint-disable import/prefer-default-export */
export function getDiscussionApps() {
  return Promise.resolve({
    features: [
      {
        id: 'lti',
        name: 'LTI Integration',
      },
      {
        id: 'discussion-page',
        name: 'Discussion Page',
      },
      {
        id: 'embedded-course-sections',
        name: 'Embedded Course Sections',
      },
      {
        id: 'embedded-course-units',
        name: 'Embedded Course Units',
      },
      {
        id: 'wcag-2.1',
        name: 'WCAG 2.1 Support',
      },
    ],
    apps: [
      {
        id: 'edx-forums',
        name: 'edX Forum',
        logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
        description: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
        supportLevel: 'Full support',
        isAvailable: true,
        featureIds: [
          'lti',
          'discussion-page',
          'embedded-course-sections',
          'embedded-course-units',
          'wcag-2.1',
        ],
      },
      {
        id: 'piazza',
        name: 'Piazza',
        logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
        description: 'Piazza is designed to connect students, TAs, and professors so every student can get the help they need when they need it',
        supportLevel: 'Partial support',
        isAvailable: true,
        featureIds: [
          'lti',
          'discussion-page',
          'embedded-course-sections',
          'wcag-2.1',
        ],
      },
      {
        id: 'yellowdig',
        name: 'Yellowdig',
        logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
        description: 'Yellowdig is the digital solution that impacts the entire student lifecycle and enables lifelong learning.',
        supportLevel: 'Coming soon',
        isAvailable: false,
        featureIds: [
          'lti',
          'discussion-page',
          'embedded-course-sections',
          'wcag-2.1',
        ],
      },
      {
        id: 'untitled-forum',
        name: 'Untitled Forum',
        logo: 'https://cdn-blog.lawrencemcdaniel.com/wp-content/uploads/2018/01/22125436/edx-logo.png',
        description: 'Start conversations with other learners, ask questions, and interact with other learners in the course.',
        supportLevel: 'Full support',
        isAvailable: true,
        featureIds: [
          'lti',
          'discussion-page',
          'embedded-course-sections',
          'embedded-course-units',
          'wcag-2.1',
        ],
      },
    ],
  });
}
