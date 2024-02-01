Permissions Check implementation
================================

For the permissions checks we basically hit 2 endpoints from the
``edx-platform`` repo:

* **Permissions**:
``/api/course_roles/v1/user_permissions/?course_id=[course_key]&user_id=[user_id]``

Which will return this structure:

.. code-block:: js

   permissions  = {
      'user_id': [user_id],
      'course_key': [course_key],
      'permissions': ['permission_1', 'permission_2']
   }

* **Permissions enabled** (which returns the boolean flag value): ``/api/course_roles/v1/user_permissions/enabled/``

The basic scaffolding for *fetching* and *storing* the permissions is located in the ``src/generic/data`` folder:

* ``api.js``: Exposes the ``getUserPermissions(courseId)`` and ``getUserPermissionsEnabledFlag()`` methods.
* ``selectors.js``: Exposes the selectors ``getUserPermissions`` and ``getUserPermissionsEnabled`` to be used by ``useSelector()``.
* ``slice.js``: Exposes the ``updateUserPermissions`` and ``updateUserPermissionsEnabled`` methods that will be used by the ``thunks.js`` file for dispatching and storing.
* ``thunks.js``: Exposes the ``fetchUserPermissionsQuery(courseId)`` and ``fetchUserPermissionsEnabledFlag()`` methods for fetching.

In the ``src/generic/hooks.jsx`` we created a custom hook for exposing the ``checkPermission`` method, so that way we can call
this method from any page and pass the permission we want to check for the current logged in user.

In this example on the ``src/course-team/CourseTeam.jsx`` page, we use the hook for checking if the current user has the ``manage_all_users``
permission:

1. First, we import the hook (line 1).

2. Then we call the ``checkPermission`` method and assign it to a const (line 2).

3. Finally we use the const for showing or hiding a button (line 8).

.. code-block:: js

  1.  import { useUserPermissions } from  '../generic/hooks';
  2.  const  hasManageAllUsersPerm  =  checkPermission('manage_all_users');

  3.  <SubHeader
  4.    title={intl.formatMessage(messages.headingTitle)}
  5.    subtitle={intl.formatMessage(messages.headingSubtitle)}
  6.    headerActions={(
  7.      isAllowActions ||
  8.      hasManageAllUsersPerm
  9.    ) && (
  10.     <Button
  11.       variant="primary"
  12.       iconBefore={IconAdd}
  13.       size="sm"
  14.       onClick={openForm}
  15.     >
  16.     {intl.formatMessage(messages.addNewMemberButton)}
  17.     </Button>
  18.   )}
  19. />
