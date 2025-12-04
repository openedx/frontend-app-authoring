Override External URLs
======================

What is getExternalLinkUrl?
---------------------------

The `getExternalLinkUrl` function is a utility from `@edx/frontend-platform` that allows for centralized management of external URLs. It enables the override of external links through configuration, making it possible to customize external references without modifying the source code directly.

URLs wrapped with getExternalLinkUrl
------------------------------------
Use cases:

1. **Accessibility Page** (`src/accessibility-page/AccessibilityPage.jsx`)
   - `COMMUNITY_ACCESSIBILITY_LINK` - Points to community accessibility resources: https://www.edx.org/accessibility

2. **Course Outline** (if applicable)
   - Documentation links
   - Help resources

3. **Other pages** (search for `getExternalLinkUrl` usage across the codebase)
   - Help documentation
   - External tool integrations

Currently, the following external URLs are wrapped with `getExternalLinkUrl` in the authoring application:

- 'https://www.edx.org/accessibility'
- 'https://docs.openedx.org/en/latest/educators/concepts/exercise_tools/about_multi_select.html'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_multi_select.html'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_dropdown.html'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/manage_numerical_input_problem.html'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/exercise_tools/add_text_input.html'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/social_sharing.html'
- 'https://docs.openedx.org/en/latest/educators/references/course_development/exercise_tools/guide_problem_types.html#advanced-problem-types'
- 'https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/latest/developing_course/course_components.html#components-that-contain-other-components'
- 'https://openai.com/api-data-privacy'
- 'https://docs.openedx.org/en/latest/educators/how-tos/course_development/create_new_library.html'
- 'https://bigbluebutton.org/privacy-policy/'
- 'https://creativecommons.org/about'

How to Override External URLs
-----------------------------

To override external URLs, you can use the frontend platform's configuration system.
This object should be added to the config object defined in the env.config.[js,jsx,ts,tsx], and must be named externalLinkUrlOverrides.

1. **Environment Configuration**
   Add the URL overrides to your environment configuration:

   .. code-block:: javascript

      const config = {
        // Other config options...
        externalLinkUrlOverrides: {
          'https://www.edx.org/accessibility': 'https://your-custom-domain.com/accessibility',
          // Add other URL overrides here
        }
      };

Examples
--------

**Original URL:** Default community accessibility link
**Override:** Your institution's accessibility policy page

.. code-block:: javascript

   // In your app configuration
   getExternalLinkUrl('https://www.edx.org/accessibility')
   // Returns: 'https://your-custom-domain.com/accessibility'
   // Instead of the default Open edX community link

Benefits
--------

- **Customization**: Institutions can point to their own resources
- **Maintainability**: URLs can be changed without code modifications  
- **Consistency**: Centralized URL management across the application
- **Flexibility**: Different environments can have different external links
