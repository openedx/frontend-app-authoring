Merging V1 Library Exports into a V2 Archive
=============================================

V1 (legacy) content libraries exported from Studio produce an XML-based OLX
archive.  V2 libraries use the ``openedx-core`` backup/restore format — a ZIP
of TOML metadata files plus the same XBlock XML.

This guide explains how a savvy operator can combine one or more V1 OLX
exports into a single V2 backup ZIP, so the content can be imported into a
V2 library without running a migration script.

.. contents:: Contents
   :local:
   :depth: 2

Background: Format Differences
-------------------------------

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - Aspect
     - V1 OLX export
     - V2 backup ZIP
   * - Container format
     - ``.tar.gz`` or ``.zip``
     - ``.zip``
   * - Library metadata
     - ``library.xml`` (XML)
     - ``package.toml`` (TOML)
   * - Component files
     - ``<type>/<block_id>/definition.xml``
     - ``entities/xblock.v1/<type>/<uuid>/component_versions/v1/block.xml``
   * - Static assets
     - ``static/<filename>``
     - ``entities/xblock.v1/<type>/<uuid>/component_versions/v1/static/<filename>``
   * - Identifiers
     - Short ``block_id`` strings
     - UUIDs (assigned during merge)
   * - Version history
     - Not preserved
     - Single ``v1`` entry per component after merge
   * - Collections
     - Not supported
     - Can be added manually (optional)

.. note::

   After a merge restore, **course content that previously referenced V1 library
   blocks via** ``usage_key`` **will not automatically point at the new V2
   components**.  Those references must be updated separately in each course.

Prerequisites
-------------

* The V1 library export ZIP(s) produced by Studio's *Export* feature.
* Access to the target Open edX instance with ``lp_load`` permissions.
* Python 3.9+ and the ``tomlkit`` package (``pip install tomlkit``) if you
  want to generate the TOML files with a script instead of by hand.
* A basic familiarity with ZIP archives (the standard ``zip`` / ``unzip``
  command-line tools or any GUI archive manager).

Step-by-Step Merge
------------------

1. Extract all V1 archives
~~~~~~~~~~~~~~~~~~~~~~~~~~

Unzip each V1 library export into its own directory::

    unzip v1_library_A.zip -d v1_library_A/
    unzip v1_library_B.zip -d v1_library_B/

Each directory will contain at minimum a ``library.xml`` file and one
subdirectory per XBlock type (e.g. ``html/``, ``problem/``, ``video/``).

2. Create the V2 directory skeleton
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

    mkdir -p v2_library/collections
    mkdir -p v2_library/entities/xblock.v1

3. Write ``package.toml``
~~~~~~~~~~~~~~~~~~~~~~~~~

Create ``v2_library/package.toml`` using the metadata from one of the
``library.xml`` files (or supply new values for the merged library):

.. code-block:: toml

    [meta]
    format_version = 1
    created_by = "operator_username"
    created_at = 2025-01-01T00:00:00Z

    [learning_package]
    title = "Merged Library"
    key = "lib:MyOrg:MergedLib"
    description = "Combined from V1 library A and V1 library B."
    created = 2025-01-01T00:00:00Z
    updated = 2025-01-01T00:00:00Z

``key`` must be unique on the target instance.  Use the pattern
``lib:<organization>:<library_code>``.

4. Convert each V1 component
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For every block in the V1 archives, do the following.

a. **Assign a UUID** — generate one per component, e.g. with Python::

       python3 -c "import uuid; print(uuid.uuid4())"

b. **Create the version directory**::

       UUID=e32d5479-9492-41f6-9222-550a7346bc37  # use your generated UUID
       TYPE=html                                   # e.g. html, problem, video
       mkdir -p "v2_library/entities/xblock.v1/${TYPE}/${UUID}/component_versions/v1/static"

c. **Copy the block XML** — the V1 export stores each block's XML either at
   ``<type>/<block_id>/definition.xml`` (subdirectory layout) or directly as
   ``<type>/<block_id>.xml`` (flat layout).  Copy it to the V2 path::

       # Subdirectory layout (most common):
       if [ -f "v1_library_A/${TYPE}/${BLOCK_ID}/definition.xml" ]; then
           cp "v1_library_A/${TYPE}/${BLOCK_ID}/definition.xml" \
              "v2_library/entities/xblock.v1/${TYPE}/${UUID}/component_versions/v1/block.xml"
       else
           # Flat layout:
           cp "v1_library_A/${TYPE}/${BLOCK_ID}.xml" \
              "v2_library/entities/xblock.v1/${TYPE}/${UUID}/component_versions/v1/block.xml"
       fi

   The XML content itself is unchanged — V2 uses the same XBlock XML format.

d. **Copy static assets** — any files from ``v1_library_A/static/`` that are
   referenced in this block's XML (look for ``/static/<filename>`` or
   ``static/<filename>``):

       cp "v1_library_A/static/diagram.png" \
          "v2_library/entities/xblock.v1/${TYPE}/${UUID}/component_versions/v1/static/"

e. **Write the entity TOML** at
   ``v2_library/entities/xblock.v1/<type>/<uuid>.toml``
   (the ``<type>/`` directory was already created by step 4b):

   .. code-block:: toml

       [entity]
       can_stand_alone = true
       key = "xblock.v1:html:e32d5479-9492-41f6-9222-550a7346bc37"
       created = 2025-01-01T00:00:00Z

       [entity.draft]
       version_num = 1

       [entity.published]
       version_num = 1

       [[version]]
       title = "Untitled"
       version_num = 1

   Set ``title`` to the ``display_name`` attribute from the block XML if one
   is present.

Repeat steps (a)–(e) for every block across all V1 archives.

5. (Optional) Create collections
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you want to group blocks from different source libraries, create a TOML
file in ``v2_library/collections/``:

.. code-block:: toml

    [collection]
    title = "From Library A"
    key = "from-library-a"
    description = ""
    created = 2025-01-01T00:00:00Z
    entities = [
        "xblock.v1:html:e32d5479-9492-41f6-9222-550a7346bc37",
        "xblock.v1:problem:256739e8-c2df-4ced-bd10-8156f6cfa90b",
    ]

6. ZIP the result
~~~~~~~~~~~~~~~~~~

The ZIP must be created from *inside* the ``v2_library/`` directory so that
``package.toml`` sits at the archive root (not nested under a
``v2_library/`` prefix)::

    cd v2_library/
    zip -r ../merged_library.zip .
    cd ..

Verify the root entry is correct::

    unzip -l merged_library.zip | head -5
    # Should show:   package.toml   (not v2_library/package.toml)

7. Load the archive
~~~~~~~~~~~~~~~~~~~~

Use the ``lp_load`` management command on the target instance::

    python manage.py lp_load merged_library.zip <username>

Or via the Python API::

    from openedx_content.api import load_learning_package
    result = load_learning_package("merged_library.zip")

On success, the library will appear in Studio's library list under the key
specified in ``package.toml``.

Further Reading
---------------

* ``openedx-core`` backup/restore format reference — full schema for the V2
  archive (``docs/openedx_content/backup_restore.rst`` in the ``openedx-core``
  repository).
* `Legacy Libraries Deprecation <https://github.com/openedx/edx-platform/issues/32457>`_
  — deprecation tracking issue for V1 (legacy) content libraries.
