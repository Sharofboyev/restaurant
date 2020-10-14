const { object } = require("joi");
const Joi = require("joi");
const pool = require("./db");

const validate = function (food) {
  const schema = new Joi.object({
    name: Joi.string().min(3).max(100).required(),
    cost: Joi.number().required(),
    quantity: Joi.number().required(),
    sale: Joi.number().default(0),
    comment: Joi.string().max(1024).default(""),
  });
  return schema.validate(food);
};

const validateOrder = function (order) {
  const schema = new Joi.object({
    names: Joi.array().items(Joi.string().min(3)).required(),
    quantities: Joi.array().items(Joi.number().integer().positive()).required(),
  });
  return order;
};

function postFood(food, cb) {
  pool.query(
    "INSERT INTO foods (name, cost, quantity, sale, comment) VALUES ($1, $2, $3, $4, $5)",
    [food.name, food.cost, food.quantity, food.sale, food.comment],
    (err, res) => {
      if (err) cb(err.message, null);
      else cb(null, "New food saved successfully!");
    }
  );
}

function updateFood(food, cb) {
  if (food.comment) {
    pool.query(
      "UPDATE foods SET cost = $2, quantity = quantity + $3, sale = $4, comment = $5 WHERE name = $1",
      [food.name, food.cost, food.quantity, food.sale, food.comment],
      (err, res) => {
        if (err) cb(err.message);
        else cb("Food updated successfully!");
      }
    );
  } else {
    pool.query(
      "UPDATE foods SET cost = $2, quantity = quantity + $3, sale = $4 WHERE name = $1",
      [food.name, food.cost, food.quantity, food.sale],
      (err, res) => {
        if (err) cb(err.message);
        else cb("Food updated successfully!");
      }
    );
  }
}

function getMenu(cb) {
  pool.query(
    "SELECT name, cost, comment, quantity, sale FROM foods WHERE quantity > 0 ORDER BY cost, name",
    (err, res) => {
      if (err) return cb(err.message);
      else return cb(res.rows);
    }
  );
}

function getMenuFull(cb) {
  pool.query("SELECT * FROM foods ORDER BY cost, name", (err, res) => {
    if (err) return cb(err.message);
    else return cb(res.rows);
  });
}

function orderFoods(order, cb) {
  var err_msg = "",
    payment = 0,
    names = Object.keys(order),
    query_string = `SELECT name, quantity, cost, sale FROM foods WHERE name IN ('${names.join(
      "', '"
    )}')`;
  pool.query(query_string, (err, res) => {
    if (err) err_msg += err.message + "\n";
    else {
      for (i = 0; i < names.length; i++) {
        let isFound = 0;
        for (j = 0; j < res.rowCount; j++) {
          if (names[i] == res.rows[j].name) {
            isFound = 1;
            if (res.rows[j].quantity >= order[names[i]]) {
              payment +=
                ((res.rows[j].cost * (100 - res.rows[j].sale)) / 100) *
                order[names[i]];
              pool.query(
                "UPDATE foods SET quantity = quantity - $1, sold = sold + $1 WHERE name = $2",
                [order[names[i]], names[i]],
                (err) => {
                  if (err) console.log(err.message);
                }
              );
            } else {
              err_msg += "There is not enough " + names[i] + "\n";
            }
            break;
          }
        }
        if (!isFound)
          err_msg += "There is not " + names[i] + " food in our restaurant\n";
      }
      return cb({ err_msg: err_msg, payment: payment });
    }
  });
}

module.exports.validateFood = validate;
module.exports.validateOrder = validateOrder;
module.exports.postFood = postFood;
module.exports.getMenu = getMenu;
module.exports.orderFoods = orderFoods;
module.exports.getMenuFull = getMenuFull;
module.exports.updateFood = updateFood;
