####################
OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB
####################
This document provides information related to overriding the maxFileSize values allowed when uploading files into the Studio.
Currently the override affects the following areas of the platform:
  
* ``Content -> Files``: This is the general location for files to be uploaded into Studio.
* ``Content -> Pages & Resources -> Textbooks``: This is the location specifically for uploading textbooks into a course.

In addition to overriding the value in ``openedx-lms-production-settings`` it is also necessary to modify Caddy's ``max_size`` handling in the ``request_body`` otherwise Caddy will fail to process your file submission(s).

The following Tutor plugin can be used as a template to configure the override value. 
In the example provided, override_value = "1024" means 1024MB or equivalently 1GB. Replace this with your preferred value.

.. code-block:: python

    from tutor import hooks

    # Instructions / info
    # override_value is defined as a string so bad formats (incorrectly entered values) don't crash Python immediately
    # User MUST enter only digits as a POSITIVE integer representing a value in MegaBytes (MB), e.g. "1024" for 1GB
    # This adds the value to the MFE_Config API as well as the CaddyFile CMS block

    override_value = "1024"  

    # --- Validation ---
    try:
        override_int = int(override_value)
        if override_int <= 0:
            raise ValueError
    except ValueError:
        raise ValueError(
            f"Invalid override_value: {override_value}. "
            "It must be a positive integer without units (e.g., 1048)."
        )

    # --- Config patches ---
    hooks.Filters.ENV_PATCHES.add_items([
        (
            "openedx-lms-production-settings",
            f"""
    MFE_CONFIG["OVERRIDE_UPLOAD_FILE_MAX_SIZE_IN_MB"] = "{override_int}"
    """
        ),
    ])

    hooks.Filters.ENV_PATCHES.add_item(
        (
            "caddyfile-cms",
            f"""
    # Maximum asset upload size in CMS/Studio
    handle /assets/* {{
        request_body {{
            max_size {override_int}MB
        }}
    }}
            """
        )
    )

Assuming your plugin is named ``override_max_asset_upload_size.py``:

* activate your plugin: ``tutor plugins enable override_max_asset_upload_size``
* restart your server instance: ``tutor local stop && tutor local start -d``
* validation: open the ``Files & Uploads`` page and confirm that your new override value is displayed instead of the default 20MB limit
