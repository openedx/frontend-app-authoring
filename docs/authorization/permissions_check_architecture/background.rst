Background
==========

This is a summary of the technical decisions made for the Roles & Permissions
project as we implemented the permissions check system in the ``frontend-app-course-authoring``.

The ``frontend-app-course-authoring`` was already created when the
Permissions project started, so it already had a coding style, store
management and its own best practices.
We aligned to these requirements.

Frontend Architecture
---------------------

*  `Readme <https://github.com/openedx/frontend-app-course-authoring#readme>`__
*  Developing locally:
   https://github.com/openedx/frontend-app-course-authoring#readme
*  **React.js** application ``version: 17.0.2``
*  **Redux** store management ``version: 4.0.5``
*  It uses **Thunk** for adding to Redux the ability of returning
   functions.
