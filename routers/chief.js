const router = require("express")();
const auth = require("../middleware/auth_chief");
const { chiefSalary } = require("../models/chief");
const { validateFood, postFood, updateFood } = require("../models/Food");

router.post("/menu", auth, (req, res) => {
  const { error, value } = validateFood(req.body);
  if (error) return res.status(400).send(error.message);
  postFood(value, (er, msg) => {
    if (er) return res.status(401).send(er);
    chiefSalary(req.chief_id, value, (answer) => {
      return res.send(
        msg + "\n\nError message from chief's salary adding:   " + answer
      );
    });
  });
});

router.put("/menu", auth, (req, res) => {
  const { error, value } = validateFood(req.body);
  if (error) return res.status(400).send(error.message);

  updateFood(value, (msg) => {
    chiefSalary(req.chief_id, value, (answer) => {
      return res.send(msg + "\n\n" + answer);
    });
  });
});

module.exports = router;
