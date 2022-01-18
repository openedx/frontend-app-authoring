|Build Status| |Codecov| |license|

frontend-app-library-authoring
==============================

Please tag **@edx/fedx-team** on any PRs or issues.  Thanks.

Introduction
------------

This is the Library Authoring micro-frontend, currently under joint development by `edX <https://www.edx.org>`_ and
`OpenCraft <https://www.opencraft.com>`_ under the auspices of `BD-14
<https://openedx.atlassian.net/wiki/spaces/COMM/pages/1545011241/BD-14+Blockstore+Powered+Content+Libraries+Taxonomies>`_.

It is being built to provide an updated library authoring experience, with improved tools for both randomized content
blocks and the ability to directly reference library content blocks in existing courses. This experience is to be
powered by the new `blockstore <https://github.com/edx/blockstore>`_ storage engine.

.. note::

   A content library is a collection of learning components (XBlocks) designed for re-use in other contexts. Components
   in a content library can be integrated into a course, used as a problem bank for randomized exams, and/or shown to
   learners directly for à la carte learning.

Devstack Installation
---------------------

Follw these steps to provision, run, and enable an instance of the Library Authoring MFE for local development via the
`official Open edX devstack
<https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/installation/index.html>`_.

1. To start, clone the devstack repository as a child of an arbitrary ``~/workspace/`` directory.

   .. code-block::

      mkdir -p ~/workspace/
      cd ~/workspace/
      git clone https://github.com/edx/devstack.git

2. Create a ``devstack/options.local.mk`` file with the following contents:

   .. code-block::

      DEFAULT_SERVICES ?= \
      credentials+discovery+ecommerce+edx_notes_api+forum+frontend-app-publisher+frontend-app-gradebook+lms+studio+frontend-app-library-authoring

   This adds ``frontend-app-library-authoring`` to the list of services the devstack will provision and enable automatically.

3. Proceed with the setup of the devstack as described in the README's `Getting Started section
   <https://github.com/edx/devstack#getting-started>`_.

   When running ``make dev.clone``, `this repository <https://github.com/edx/frontend-app-library-authoring.git>`_ will
   be cloned automatically as a the sibling to the `~/workspace/devstack/` directory.

   Once devstack provisioning is complete, check that this MFE's container is running by executing the following from
   inside ``~/workspace/devstack``:

   .. code-block::

      make dev.ps | grep library-authoring

   You should see the container with status "Up", exposing port 3001:

   .. code-block::

      edx.devstack.frontend-app-library-authoring   docker-entrypoint.sh bash  ...   Up       0.0.0.0:3001->3001/tcp

4. Now set up blockstore for this devstack exactly as described in its README's `Using with Docker Devstack
   <https://github.com/edx/blockstore/#using-with-docker-devstack>`_ section.

   This will setup the blockstore container, configure the LMS and the CMS to accept requests from it (and vice-versa),
   create a "Devstack Content Collection" in blockstore, and finally create a sample "DeveloperInc" organization in the
   LMS that can be used to create content.

   There's no need to log in to blockstore in your web browser directly, so feel free to skip the last step.

5. In a Studio shell, enable the ``ENABLE_LIBRARY_AUTHORING_MICROFRONTEND`` feature flag:

   .. code-block::

      make studio-shell
      vim /edx/etc/studio.yml
      ---
      FEATURES:
          ENABLE_LIBRARY_AUTHORING_MICROFRONTEND: true

   Exit the shell and restart Studio so changes take effect:

   .. code-block::

      make studio-restart

6. On a browser, go to http://localhost:18010/admin/waffle/flag/, log in as an admin (such as the sample user ``edx``)
   and create a ``studio.library_authoring_mfe`` waffle flag, and enabling it for everyone.

   This will make it so that clicking on the Libraries tab in `Studio <http://localhost:18010/home/>`_ will take you to
   the Library Authoring MFE as a logged-in user.

   .. image:: ./docs/images/screenshot_mfe.png

7. Once at the `Library Authoring page <http://localhost:3001>`_, to create a blockstore-based library click on the "New
   Library" button on the top right-hand corner, filling in Title, Organization, and ID, and making sure to select the
   "Complex (beta)" type.  (In contrast, creating a "Legacy" library would have it backed by modulestore.)

   .. image:: ./docs/images/screenshot_creating.png

8. Finally, adding components is done by selecting the desired type under the "Add New Component" heading at the bottom
   of the list of existing ones.  You can edit them by clicking on the corresponding "Edit" button, once they're visible
   in the list.

   .. image:: ./docs/images/screenshot_adding_components.png

Project Structure
-----------------

The source for this project is organized into nested submodules according to the ADR `Feature-based Application
Organization
<https://github.com/edx/frontend-template-application/blob/master/docs/decisions/0002-feature-based-application-organization.rst>`_.

Build Process Notes
-------------------

**Production Build**

The production build is created with ``npm run build``.

Internationalization
--------------------

Please see `edx/frontend-platform's i18n module
<https://edx.github.io/frontend-platform/module-Internationalization.html>`_ for documentation on internationalization.
The documentation explains how to use it, and the `How To
<https://github.com/edx/frontend-i18n/blob/master/docs/how_tos/i18n.rst>`_ has more detail.

.. |Build Status| image:: https://github.com/edx/frontend-app-library-authoring/workflows/node_js%20CI/badge.svg?branch=master
   :target: https://github.com/edx/frontend-app-library-authoring/actions?query=workflow%3A%22node_js+CI%22
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-library-authoring/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/edx/frontend-app-library-authoring
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-library-authoring.svg
   :target: @edx/frontend-app-library-authoring

Known Issues
------------

* [SE-3989] There is a fatal blockstore integration test failure that is likely triggering search bugs, related to
  `edx/edx-search#104 <https://github.com/edx/edx-search/pull/104>`_.

* Some component types, such as text (HTML), videos and CAPA problems, can be added to libraries but cannot be edited
  using Studio's visual authoring tools.  The issue manifests itself as either an error message when clicking the "Edit"
  tab of such a block (particularly with the HTML block) or malformed rendering (for the video block).  This is a
  limitation of Studio, not this MFE, and work is under way to address the issue accordingly.  (It is still possible to
  edit a block with OLX, however.)

* Block previews may be jittery in the authoring preview.  This is particularly true of the video block.  It does not
  affect usage of the block in the LMS or elsewhere, though.

* The current component editing flow is a direct port of `ramshackle <https://github.com/open-craft/ramshackle>`_ with
  only minor improvements.  It is pending an UX audit and internationalization, among other things.

* Users with view only access are able to see the 'User Access' menu item, despite the fact it will just kick them back
  to the detail view.

* The library isn't always updated between when it is changed in the edit view/create view and when you return to the
  authoring view. So sometimes you may need to refresh after changing a library to get the right authoring view.

* Styling is not final, and is pending a Paragon update so that the UI will more closely match Studio's.

* There are a handful of non-fatal errors that appear when running tests.  They appear to be related to the Modal
  component from Paragon not being up to date with the version of React in this repository.

Development Roadmap
-------------------

The following is a list of current short-term development targets, in (rough) descending order of priority:

* [Studio enhancement] Implement embeddable visual editors for the HTML, video, and problem blocks

* [Studio enhancement] An improved "source from library" workflow that will let course authors include library content
  in existing courseware.

* [MFE enhancement] Iteration and refinement of the library authoring/publishing flow.

* [MFE bugfix] Fixing the `Known Issues <#known-issues>`_ that are not explicitly listed in this Roadmap.
