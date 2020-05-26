const marked = require('marked');
const purify = require('sanitize-html');

function getMarkedContent(data) {
  const markedData = marked(purify(data));
  return markedData;
}
module.exports = getMarkedContent;
