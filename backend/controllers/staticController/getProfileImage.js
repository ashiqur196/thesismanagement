const path = require('path');

async function getProfileImage(req, res) {
  const image = req.params.filename;
  res.sendFile(path.join(__dirname, '../../uploads/profiles/' + image));
}


module.exports = getProfileImage;