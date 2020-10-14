const pool = require("./db");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const newWaiter = function (waiter) {
  const waiterSchema = new Joi.object({
    name: Joi.string().min(3).max(100).required(),
    surname: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(5).max(1024).required(),
    phone_number: Joi.string()
      .max(20)
      .pattern(/^[0-9, +, -]+$/)
      .required(),
  });
  return waiterSchema.validate(waiter);
};

const postWaiter = async function (waiter, cb) {
  const salt = await bcrypt.genSalt(10);
  waiter.password = await bcrypt.hash(waiter.password, salt);
  pool.query(
    "INSERT INTO waiters (name, surname, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING waiter_id",
    [waiter.name, waiter.surname, waiter.password, waiter.phone_number],
    (err, res) => {
      if (err) cb(err.message);
      else cb(`New waiter's ID is ${res.rows[0].waiter_id}`);
      console.log(res);
    }
  );
};

function waiterSalary(waiter_id, salary, cb) {
  pool.query(
    "UPDATE waiters SET salary = salary + $1 WHERE waiter_id = $2",
    [salary, waiter_id],
    (err, res) => {
      if (err) cb(err.message);
      else {
        if (res.rowCount == 0)
          return cb("There is not a waiter with " + waiter_id + " ID.");
        else return cb("Waiter's salary added successdully.");
      }
    }
  );
}

module.exports.newWaiter = newWaiter;
module.exports.postWaiter = postWaiter;
module.exports.waiterSalary = waiterSalary;
