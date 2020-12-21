|Build Status| |Codecov| |license|

frontend-app-course-authoring
=================================

Please tag `@edx/teaching-and-learning <https://github.com/orgs/edx/teams/teaching-and-learning>` on any PRs or issues.  Thanks.

After Copying The Template
--------------------------

**Prerequisite**

`Devstack <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/installation/index.html>`_.  If you start Devstack with ``make dev.up.ecommerce`` that should give you everything you need as a companion to this frontend.

**Installation and Startup**

In the following steps, replace "frontend-app-course-authoring' with the name of the repo you created when copying this template above.

1. Clone your new repo:

  ``git clone https://github.com/edx/frontend-app-course-authoring.git``

2. Install npm dependencies:

  ``cd frontend-app-course-authoring && npm install``

3. Start the dev server:

  ``npm start``

The dev server is running at `http://localhost:2001 <http://localhost:2001>`_.

Project Structure
-----------------

The source for this project is organized into nested submodules according to the ADR `Feature-based Application Organization <https://github.com/edx/frontend-app-course-authoring/blob/master/docs/decisions/0002-feature-based-application-organization.rst>`_.

Build Process Notes
-------------------

**Production Build**

The production build is created with ``npm run build``.

Internationalization
--------------------

Please see `edx/frontend-platform's i18n module <https://edx.github.io/frontend-platform/module-Internationalization.html>`_ for documentation on internationalization.  The documentation explains how to use it, and the `How To <https://github.com/edx/frontend-i18n/blob/master/docs/how_tos/i18n.rst>`_ has more detail.

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-course-authoring.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-app-course-authoring
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-course-authoring/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/edx/frontend-app-course-authoring
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-course-authoring.svg
   :target: @edx/frontend-app-course-authoring
