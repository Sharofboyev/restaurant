const { validateOrder, getMenu, orderFoods } = require("../models/Food");
const router = require("express")();

router.get("/menu", (req, res) => {
  getMenu((rows) => {
    return res.send(rows);
  });
});

router.post("/menu/order", (req, res) => {
  const { error, value } = validateOrder(req.body);
  if (error) return res.status(400).send(error.message);

  orderFoods(req.body, ({ err_msg, payment }) => {
    return res.send(err_msg + `\nYou should pay: ${payment} $`);
  });
});

module.exports = router;
