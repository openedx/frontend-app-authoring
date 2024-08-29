This library is meant for high-level components related to "content" types, which sometimes correspond to xblocks --- so videos, html, problems, etc.
  - This is a higher-level layer on top of paragon.

The components may be shared across multiple frontends.
  - For example, components may be used by both the learning MFE, the course authoring MFE, and the shared content MFE.
  - Video-playing components may be used for previewing in editing contexts, etc.

The components cover many types of content, not just a single one.
  - For example, HTML editing frontend might share code and style with video editing or problem editing.
  - This will also help keep style and accessibility consistent across different content types.
