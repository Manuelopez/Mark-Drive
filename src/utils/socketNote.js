const marked = require('marked');
const purify = require('sanitize-html');

marked.setOptions({
  gfm: true,
  breaks: true
});

function getMarkedContent(data) {
  const markedData = marked(data);
  return markedData;
}
function getCleanContent(data) {
  const cleanData = purify(data);
  return cleanData;
}
module.exports = { getMarkedContent, getCleanContent };
