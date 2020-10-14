module.exports = function (err, req, res, next) {
  console.log(err);
  return res.status(500).send("Something failed. Error message is in console.");
};
