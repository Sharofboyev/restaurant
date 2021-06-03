const express = require("express");
const {Pool} = require("pg");
//const config = require("../config");
const Joi = require("joi");

const pool = new Pool({connectionString: "postgressql://postgres:postgres@localhost:5432/test"})

const router = express.Router()
const postSchema = new Joi.object({
    id: Joi.number().required(),
    is_bot: Joi.boolean().default(null),
    first_name: Joi.string().max(255).required(),
    last_name: Joi.string().max(255),
    username: Joi.string().max(255),
    language_code: Joi.string().max(100),
    broadcast_status: Joi.string().max(255),
    service_status: Joi.boolean().default(false),
    balance: Joi.string().max(255),
    end_date: Joi.date()
});

router.post("/users", (req, res) => {
    const {error, value} = postSchema.validate(req.body);
    if (error) return res.send({ status: 400, message: "Bad request" });

    pool.query("INSERT INTO users(id, is_bot, first_name, last_name, username, language_code, broadcast_status, service_status, balance, end_date)" +
    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO UPDATE " + 
    "SET is_bot = $2, first_name = $3, last_name = $4, username = $5, language_code = $6, broadcast_status = $7, service_status  = $8, balance = $9, end_date = $10 RETURNING *",
    [value.id, value.is_bot, value.first_name, value.last_name, value.username, value.language_code, value.broadcast_status, value.service_status, value.balance, value.end_date],
    (err, response) => {
        if (err) {
            console.log(err.message);
            return res.send({status: 401, message: "Database error"});
        }
        else return res.send({status: 200, message: "Successfully saved!"}); 
    })
})

module.exports = router;