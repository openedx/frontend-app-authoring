Local Development & Testing
===========================

Backend
~~~~~~~

The backend endpoints lives in the ``edx-platform`` repo, specifically
in this file: ``openedx/core/djangoapps/course_roles/views.py``

For quickly testing the different permissions and the flag change you
can tweak the values directly in the above file.

*  ``UserPermissionsView`` is in charge of returning the permissions, so
   for sending the permissions you want to check, you could do something
   like this:

.. code-block:: python

      permissions  = {
         'user_id': user_id,
         'course_key': str(course_key),
         #'permissions': sorted(permission.value.name for permission in permissions_set),
         'permissions': ['the_permissions_being_tested']
      }
      return Response(permissions)

By making this change, the permissions object will be bypassed and
send a plain array with the specific permissions being tested.


*  ``UserPermissionsFlagView`` is in charge of returning the flag value
   (boolean), so you can easily turn the boolean like this:

.. code-block:: python

      #payload  = {'enabled': use_permission_checks()}
      payload  = {'enabled': true}
      return Response(payload)

Flags
~~~~~

You’ll need at least 2 flags to start:

* The basic flag for enabling the backend permissions system: ``course_roles.use_permission_checks``.

* The flag for enabling the page you want to test, for instance Course Team: ``contentstore.new_studio_mfe.use_new_course_team_page``.

All flags for enabling pages in the Studio MFE are listed
`here <https://2u-internal.atlassian.net/wiki/x/CQCcHQ>`__.

Flags can be added by:
^^^^^^^^^^^^^^^^^^^^^^

*  Enter to ``http://localhost:18000/admin/``.
*  Log in as an admin.
*  Go to ``http://localhost:18000/admin/waffle/flag/``.
*  Click on ``+ADD FLAG`` button at the top right of the page and add
   the flag you need.

Testing
~~~~~~~

For unit testing you run the npm script included in the ``package.json``, you can use it plainly for testing all components at once: ``npm run test``.

Or you can test one file at a time: ``npm run test path-to-file``.
