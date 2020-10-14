const auth = require("../middleware/auth_waiter");
const { validateOrder, getMenu, orderFoods } = require("../models/Food");
const { waiterSalary } = require("../models/waiter");
const router = require("express")();

router.get("/menu", (req, res) => {
  getMenu((rows) => {
    return res.send(rows);
  });
});

router.post("/menu/order_waiter", auth, (req, res) => {
  const { error, value } = validateOrder(req.body);
  if (error) return res.status(400).send(error.message);

  orderFoods(value, ({ err_msg, payment }) => {
    waiterSalary(req.waiter_id, payment / 10, (answer) => {
      return res.send(
        err_msg +
          `\nClient should pay: ${(payment * 11) / 10} $` +
          "\n" +
          answer
      );
    });
  });
});

module.exports = router;
