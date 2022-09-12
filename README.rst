|Build Status| |Codecov| |license|

frontend-app-course-authoring
=============================

Please tag `@edx/teaching-and-learning <https://github.com/orgs/edx/teams/teaching-and-learning>`_ on any PRs or issues.  Thanks.

Prerequisite
------------

`Devstack <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/installation/index.html>`_.  If you start Devstack with ``make dev.up.studio`` that should give you everything you need as a companion to this frontend.

Installation and Startup
------------------------

1. Clone the repo:

  ``git clone https://github.com/openedx/frontend-app-course-authoring.git``

2. Install npm dependencies:

  ``cd frontend-app-course-authoring && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:2001 <http://localhost:2001>`_.

If your devstack includes the default Demo course, you can visit the following URLs to see content:

- `Proctored Exam Settings <http://localhost:2001/course/course-v1:edX+DemoX+Demo_Course/proctored-exam-settings>`_
- `Pages and Resources <http://localhost:2001/course/course-v1:edX+DemoX+Demo_Course/pages-and-resources>`_ (work in progress)

Production Build
----------------

The production build is created with ``npm run build``.

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-course-authoring.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-app-course-authoring
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-course-authoring/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/edx/frontend-app-course-authoring
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-course-authoring.svg
   :target: @edx/frontend-app-course-authoring
