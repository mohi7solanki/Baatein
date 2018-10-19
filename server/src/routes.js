module.exports = function (app) {
  app.post('/register', function (req, res) {
    res.send({
      message: `Hello ${req.body.email}you are registered`
    })
  })
}
