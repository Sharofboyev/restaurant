const pool = require("./db");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const newChief = function(chief) {
    const chiefSchema = new Joi.object({
        name: Joi.string().min(3).max(100).required(),
        surname: Joi.string().min(3).max(100).required(),
        password: Joi.string().min(5).max(1024).required(),
        phone_number: Joi.string()
            .max(20)
            .pattern(/^[0-9, +, -]+$/)
            .required(),
        cooks: Joi.array().items(Joi.string()),
    });
    return chiefSchema.validate(chief);
};

const postChief = async function(chief, cb) {
    const salt = await bcrypt.genSalt(10);
    chief.password = await bcrypt.hash(chief.password, salt);
    pool.query(
        "INSERT INTO chiefs (name, surname, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING chief_id", [chief.name, chief.surname, chief.password, chief.phone_number],
        (err, res) => {
            if (err) cb(err.message);
            else cb(`New chief's ID is ${res.rows[0].chief_id}`);
        }
    );
};

function chiefSalary(chief_id, food, cb) {
    pool.query(
        "UPDATE chiefs SET cooked = " +
        "CASE WHEN cooked IS NULL THEN jsonb_build_object($1::varchar, $2::integer) " +
        "WHEN cooked -> $1 IS NULL THEN cooked || jsonb_build_object($1, $2) " +
        "ELSE cooked || jsonb_build_object($1, (cooked ->> $1)::integer + $2) END, salary = salary + $3 WHERE chief_id = $4 returning name", [
            food.name,
            food.quantity,
            (food.cost * (100 - food.sale) * 0.01 * food.quantity) / 2,
            chief_id,
        ],
        (err, res) => {
            if (err) return cb(err.message);
            else {
                return cb(
                    "Chief " + res.rows[0].name + "'s salary added successfully."
                );
            }
        }
    );
}

function get(chief_id, cb) {
    pool.query(
        "SELECT name, chief_id, password FROM chiefs WHERE chief_id = $1", [chief_id],
        (err, res) => {
            if (err) return cb(err.message, null);
            cb(null, res);
        }
    );
}

module.exports.newChief = newChief;
module.exports.postChief = postChief;
module.exports.chiefSalary = chiefSalary;
module.exports.getChief = get;