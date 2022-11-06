|Build Status| |Codecov| |license|

#############################
frontend-app-course-authoring
#############################

Please tag `@edx/teaching-and-learning <https://github.com/orgs/edx/teams/teaching-and-learning>`_ on any PRs or issues.  Thanks.

************
Introduction
************

This is the Course Authoring micro-frontend, currently under development by `2U <https://2u.com>`_.

Its purpose is to provide both a framework and UI for new or replacement React-based authoring features outside ``edx-platform``.  You can find the current set described below.

********
Features
********

Feature: Pages and Resources Studio Tab
=======================================

Enables a "Pages & Resources" menu item in Studio, under the "Content" menu.

Requirements
------------

The following are external requirements for this feature to function correctly:

* ``edx-platform`` Django settings:

  * ``COURSE_AUTHORING_MICROFRONTEND_URL``: must be set in the CMS environment and point to this MFE's deployment URL.

* ``edx-platform`` Waffle flags:

  * ``discussions.pages_and_resources_mfe``: must be enabled for the set of users meant to access this feature.

* `frontend-app-learning <https://github.com/openedx/frontend-app-learning>`_: This MFE expects it to be the LMS frontend.
* `frontend-app-discussions <https://github.com/openedx/frontend-app-discussions/>`_: This is what the "Discussions" configuration provided by this feature actually configures.  Without it, discussion settings are ignored.

Configuration
-------------

In additional to the standard settings, the following local configuration items are required:

* ``LEARNING_BASE_URL``: points to Learning MFE; necessary so that the `View Live` button works
* ``ENABLE_PROGRESS_GRAPH_SETTINGS``: allow enabling or disabling the learner progress graph course-wide

Feature Description
-------------------

Clicking on the "Pages & Resources" menu item takes the user to the course's ``pages-and-resources`` standalone page in this MFE.  (In a devstack, for instance: http://localhost:2001/course/course-v1:edX+DemoX+Demo_Course/pages-and-resources.)

UX-wise, **Pages & Resources** is meant to look like a Studio tab, so reproduces Studio's header.

For a particular course, this page allows one to:

* Configure the new Discussions MFE (making this a requirement for it).  This includes:

  * Enabling/disabling the feature entirely
  * Picking a different discussion provider, while showing a comparison matrix between them:

    * edX
    * Ed Discussion
    * InScribe
    * Piazza
    * Yellowdig

  * Allowing to configure the selected provider

* Enable/Disable learner progress
* Enable/Disable learner notes
* Enable/Disable the learner wiki
* Enable/Disable the LMS calculator
* Go to the textbook management page in Studio (in a devstack: http://localhost:18010/textbooks/course-v1:edX+DemoX+Demo_Course)
* Go to the custom page management page in Studio(in a devstack http://localhost:18010/tabs/course-v1:edX+DemoX+Demo_Course)

Feature: New React XBlock Editors
=================================

This allows an operator to enable the use of new React editors for the HTML, Video, and Problem XBlocks, all of which are provided here.

Requirements
------------

* ``edx-platform`` Django settings:

  * ``COURSE_AUTHORING_MICROFRONTEND_URL``: must be set in the CMS environment and point to this MFE's deployment URL.

* ``edx-platform`` Waffle flags:

  * ``new_core_editors.use_new_text_editor``: must be enabled for the new HTML Xblock editor to be used in Studio
  * ``new_core_editors.use_new_video_editor``: must be enabled for the new Video Xblock editor to be used in Studio
  * ``new_core_editors.use_new_problem_editor``: must be enabled for the new Problem Xblock editor to be used in Studio

Configuration
-------------

In additional to the standard settings, the following local configuration item is required:

* ``ENABLE_NEW_EDITOR_PAGES``: must be enabled in order to actually present the new XBlock editors

Feature Description
-------------------

When a corresponding waffle flag is set, upon editing a block in Studio, the view is rendered by this MFE instead of by the XBlock's authoring view.  The user remains in Studio.

.. note::

   The new editors themselves are currently implemented in a repository outside ``openedx``: `frontend-lib-content-components <https://github.com/edx/frontend-lib-content-components/>`_, a dependency of this MFE.  This repository is slated to be moved to the ``openedx`` org, however.

Feature: New Proctoring Exams View
==================================

Requirements
------------

* ``edx-platform`` Django settings:

  * ``COURSE_AUTHORING_MICROFRONTEND_URL``: must be set in the CMS environment and point to this MFE's deployment URL.
  * ``ZENDESK_*``: necessary if automatic ZenDesk ticket creation is desired

* ``edx-platform`` Feature flags:

  * ``ENABLE_EXAM_SETTINGS_HTML_VIEW``: this feature flag must be enabled for the link to the settings view to be shown

* `edx-exams <https://github.com/edx/edx-exams>`_: for this feature to work, the ``edx-exams`` IDA must be deployed and its API accessible by the browser

Configuration
-------------

In additional to the standard settings, the following local configuration item is required:

* ``EXAMS_BASE_URL``: URL to the ``edx-exams`` deployment

Feature Description
-------------------

In Studio, a new item ("Proctored Exam Settings") is added to "Other Course Settings" in the course's "Certificates" settings page.  When clicked, this takes the author to the corresponding page in the Course Authoring MFE, where one can:

* Enable proctored exams for the course
* Allow opting out of proctored exams
* Select a proctoring provider
* Enable automatic creation of Zendesk tickets for "suspicious" proctored exam attempts


**********
Developing
**********

`Devstack <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/installation/index.html>`_.  If you start Devstack with ``make dev.up.studio`` that should give you everything you need as a companion to this frontend.

Installation and Startup
========================

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


*********
Deploying
*********

Production Build
================

The production build is created with ``npm run build``.

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-course-authoring.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-app-course-authoring
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-course-authoring/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/edx/frontend-app-course-authoring
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-course-authoring.svg
   :target: @edx/frontend-app-course-authoring
