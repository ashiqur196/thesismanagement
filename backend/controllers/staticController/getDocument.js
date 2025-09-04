const path = require('path');

async function getDocument(req, res) {
  const image = req.params.filename;
  res.sendFile(path.join(__dirname, '../../uploads/documents/' + image));
}


module.exports = getDocument;