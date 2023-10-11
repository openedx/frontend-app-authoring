const getStyles = () => (
  `@import url("https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&display=swap");

  .mce-content-body *[contentEditable=false] {
    cursor: default;
  }
  .mce-content-body *[contentEditable=true] {
    cursor: text;
  }
  .mce-content-body div.mce-resizehandle {
    background-color: #4099ff;
    border-color: #4099ff;
    border-style: solid;
    border-width: 1px;
    box-sizing: border-box;
    height: 10px;
    position: absolute;
    width: 10px;
    z-index: 1298;
  }
  .mce-content-body div.mce-resizehandle:hover {
    background-color: #4099ff;
  }
  .mce-content-body div.mce-resizehandle:nth-of-type(1) {
    cursor: nwse-resize;
  }
  .mce-content-body div.mce-resizehandle:nth-of-type(2) {
    cursor: nesw-resize;
  }
  .mce-content-body div.mce-resizehandle:nth-of-type(3) {
    cursor: nwse-resize;
  }
  .mce-content-body div.mce-resizehandle:nth-of-type(4) {
    cursor: nesw-resize;
  }
  .mce-content-body .mce-resize-backdrop {
    z-index: 10000;
  }
  .mce-content-body .mce-clonedresizable {
    cursor: default;
    opacity: 0.5;
    outline: 1px dashed black;
    position: absolute;
    z-index: 10001;
  }
  .mce-content-body .mce-clonedresizable.mce-resizetable-columns th,
  .mce-content-body .mce-clonedresizable.mce-resizetable-columns td {
    border: 0;
  }
  .mce-content-body .mce-resize-helper {
    background: #555;
    background: rgba(0, 0, 0, 0.75);
    border: 1px;
    border-radius: 3px;
    color: white;
    display: none;
    font-family: sans-serif;
    font-size: 12px;
    line-height: 14px;
    margin: 5px 10px;
    padding: 5px;
    position: absolute;
    white-space: nowrap;
    z-index: 10002;
  }
  .mce-content-body img[data-mce-selected],
  .mce-content-body video[data-mce-selected],
  .mce-content-body audio[data-mce-selected],
  .mce-content-body object[data-mce-selected],
  .mce-content-body embed[data-mce-selected],
  .mce-content-body table[data-mce-selected] {
    outline: 3px solid #b4d7ff;
  }
  .mce-content-body *[contentEditable=false] *[contentEditable=true]:focus {
    outline: 3px solid #b4d7ff;
  }
  .mce-content-body *[contentEditable=false] *[contentEditable=true]:hover {
    outline: 3px solid #b4d7ff;
  }
  .mce-content-body *[contentEditable=false][data-mce-selected] {
    cursor: not-allowed;
    outline: 3px solid #b4d7ff;
  }
  .mce-content-body.mce-content-readonly *[contentEditable=true]:focus,
  .mce-content-body.mce-content-readonly *[contentEditable=true]:hover {
    outline: none;
  }
  .mce-content-body *[data-mce-selected="inline-boundary"] {
    background-color: #b4d7ff;
  }
  .mce-content-body .mce-edit-focus {
    outline: 3px solid #b4d7ff;
  }
  .mce-content-body img::-moz-selection {
    background: none;
  }
  .mce-content-body img::selection {
    background: none;
  }
  .mce-content-body {
      padding: 0;
      background-color: #fff;
      font-family: 'Open Sans', Verdana, Arial, Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #3c3c3c;
      scrollbar-3dlight-color: #F0F0EE;
      scrollbar-arrow-color: #676662;
      scrollbar-base-color: #F0F0EE;
      scrollbar-darkshadow-color: #DDDDDD;
      scrollbar-face-color: #E0E0DD;
      scrollbar-highlight-color: #F0F0EE;
      scrollbar-shadow-color: #F0F0EE;
      scrollbar-track-color: #F5F5F5;
  }
  .mce-content-body h1,
  .mce-content-body .hd-1 {
      color: #3c3c3c;
      font-weight: normal;
      font-size: 2em;
      line-height: 1.4em;
      margin: 0 0 1.41575em 0;
      text-transform: initial;
  }
  .mce-content-body h2,
  .mce-content-body .hd-2 {
      letter-spacing: 1px;
      margin-bottom: 15px;
      color: #646464;
      font-weight: 300;
      font-size: 1.2em;
      line-height: 1.2em;
      text-transform: initial;
  }
  .mce-content-body h3,
  .mce-content-body .hd-3 {
    margin: 0 0 10px 0;
    font-size: 1.1125em;
    font-weight: 400;
    text-transform: initial;
  }
  .mce-content-body .hd-3,
  .mce-content-body h4,
  .mce-content-body .hd-4,
  .mce-content-body h5,
  .mce-content-body .hd-5,
  .mce-content-body h6,
  .mce-content-body .hd-6 {
      margin: 0 0 10px 0;
      font-weight: 600;
  }
  .mce-content-body h4,
  .mce-content-body .hd-4 {
    font-size: 1em;
  }
  .mce-content-body h5,
  .mce-content-body .hd-5 {
      font-size: 0.83em;
  }
  .mce-content-body h6,
  .mce-content-body .hd-6 {
      font-size: 0.75em;
  }
  .mce-content-body p {
      margin-bottom: 1.416em;
      margin-top: 0;
      font-size: 1em;
      line-height: 1.6em !important;
      color: #3c3c3c;
  }
  .mce-content-body em, .mce-content-body i {
      font-style: italic;
  }
  .mce-content-body strong, .mce-content-body b {
      font-weight: bold;
  }
  .mce-content-body p + p, .mce-content-body ul + p, .mce-content-body ol + p {
      margin-top: 20px;
  }
  .mce-content-body ol, .mce-content-body ul {
      margin: 1em 0;
      padding: 0 0 0 1em;
      color: #3c3c3c;
  }
  .mce-content-body ol li, .mce-content-body ul li {
      margin-bottom: 0.708em;
  }
  .mce-content-body ol {
      list-style: decimal outside none;
      margin: 0;
  }
  .mce-content-body ul {
      list-style: disc outside none;
      margin: 0;
  }
  .mce-content-body a, .mce-content-body a:link, .mce-content-body a:visited, .mce-content-body a:hover, .mce-content-body a:active {
      color: #0075b4;
      text-decoration: none;
  }
  .mce-content-body img {
      max-width: 100%;
  }
  .mce-content-body pre {
    margin: 1em 0;
    color: #3c3c3c;
    font-family: monospace, serif;
    font-size: 1em;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .mce-content-body code {
      font-family: monospace, serif;
      background: none;
      color: #3c3c3c;
      padding: 0;
  }
  .mce-content-body[data-mce-placeholder] {
    position: relative;
  }
  .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
    color: rgba(34, 47, 62, 0.7);
    content: attr(data-mce-placeholder);
    position: absolute;
  }
  .mce-content-body:not([dir=rtl])[data-mce-placeholder]:not(.mce-visualblocks)::before {
    margin: 0;
  }
  .mce-content-body[dir=rtl][data-mce-placeholder]:not(.mce-visualblocks)::before {
    margin: 0;
  }`
);

export { getStyles };

export default getStyles({});
