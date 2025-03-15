import sql from "../db/sql.js";
import { BadRequestError, UnauthorizedError } from "../errors/index.js";
import bcrypt from "bcrypt";

const loginFailed = (req, res, next) => {
  return res
    .status(400)
    .json({ msg: "Login Failed! Check email or password!" });
};
const login = async (req, res, next) => {
  const { userID, email, password } = req.body;
  if (userID) {
    const user = await sql(
      `SELECT first_name, last_name, email FROM users where id = $1`,
      [req.body.userID]
    );
    return res.json({ user: user[0] });
  } else {
    if (!email || !password)
      return next(new BadRequestError("Incomplete Credentials"));

    const dbUser = await sql(`SELECT * FROM users where email = $1`, [email]);
    if (!dbUser.length) return next(new BadRequestError("User Doesn't exists"));
    const { password: storedPassword, ...restDBData } = dbUser[0];
    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (passwordMatch) {
      return res.json({ user: restDBData });
    } else {
      return next(new BadRequestError("Password doesn't match"));
    }
  }
};

const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const response = await sql(`SELECT * FROM users WHERE email = $1`, [email]);
  if (response.length) {
    return next(new BadRequestError("User Already Exists"));
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      console.log("Bcrypt hashing error", err);
    } else {
      const result = await sql(
        `INSERT INTO users (first_name, last_name, email, password) vALUES ($1, $2, $3, $4) RETURNING *`,
        [firstName, lastName, email, hash]
      );
      const user = result[0];
      return res.json({ user });
    }
  });
};

const logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) console.log(err);
    else res.json({ msg: "Logout Successful!" });
  });
};

export { login, register, loginFailed, logout };
