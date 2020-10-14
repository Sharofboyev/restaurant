const { newChief, postChief } = require("../models/chief");
const { getMenuFull } = require("../models/Food");
const { newWaiter, postWaiter } = require("../models/waiter");
const auth = require("../middleware/auth_manager");
const router = require("express")();

router.post("/chiefs/new", auth, (req, res) => {
  let chief = req.body;
  const { error, value } = newChief(chief);
  if (error) return res.status(400).send(error.message);

  postChief(value, (msg) => {
    return res.send(msg);
  });
});

router.post("/waiters/new", auth, (req, res) => {
  let { error, value } = newWaiter(req.body);
  if (error) return res.status(400).send(error.message);

  postWaiter(value, (waiter) => {
    return res.send(waiter);
  });
});

router.get("/menu/full", auth, (req, res) => {
  getMenuFull((msg) => {
    return res.send(msg);
  });
});

module.exports = router;
