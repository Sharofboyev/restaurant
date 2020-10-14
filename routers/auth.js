const express = require("express");
const bcrypt = require("bcrypt");
const router = express();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const config = require("config");
const pool = require("../models/db");
const { getChief } = require("../models/chief");

router.post("/chiefs/auth", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  getChief(req.body.id, async (err, chief) => {
    if (err) return res.status(401).send(err);
    if (!chief.rowCount) return res.status(400).send("Invalid id or password.");

    chief = chief.rows[0];
    const validPassword = await bcrypt.compare(
      req.body.password,
      chief.password
    );
    if (!validPassword) return res.status(400).send("Invalid id or password.");

    const token = jwt.sign(
      {
        _id: chief.chief_id,
      },
      config.get("jwtPrivateKey")
    );

    return res.header("x-auth-token", token).send("You are authorised!");
  });
});

router.post("/waiters/auth", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  getWaiter(req.body.chief_id, async (err, waiter) => {
    if (err) return res.status(401).send(err);
    if (!waiter.rowCount)
      return res.status(400).send("Invalid id or password.");

    waiter = waiter.rows[0];
    const validPassword = await bcrypt.compare(
      req.body.password,
      waiter.password
    );
    if (!validPassword) return res.status(400).send("Invalid id or password.");

    const token = jwt.sign(
      {
        _id: waiter.waiter_id,
      },
      config.get("jwtPrivateKey")
    );

    return res.header("x-auth-token", token).send("You are authorised!");
  });
});

router.post("/manager/auth", async (req, res) => {
  const { error } = validateManager(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  pool.query(
    "SELECT * FROM manager WHERE username = $1",
    [req.body.manager],
    async (err, manager) => {
      if (err) return res.status(401).send(err);
      else {
        if (!manager.rowCount)
          return res.status(400).send("Invalid username or password.");
        manager = manager.rows[0];
        const validPassword = await bcrypt.compare(
          req.body.password,
          manager.password
        );
        if (!validPassword)
          return res.status(400).send("Invalid id or password.");

        const token = jwt.sign(
          {
            username: manager.username,
          },
          config.get("jwtPrivateKey")
        );

        return res.header("x-auth-token", token).send("You are authorised!");
      }
    }
  );
});

const validate = function (req) {
  const schema = new Joi.object({
    id: Joi.number().integer().positive().required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
};

const validateManager = function (manager) {
  const schema = new Joi.object({
    manager: Joi.string().min(5).max(127).required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(manager);
};

module.exports = router;
