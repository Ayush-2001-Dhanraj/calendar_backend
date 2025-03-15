import sql from "../db/sql.js";
import { BadRequestError, UnauthorizedError } from "../errors/index.js";
import bcrypt from "bcrypt";

const loginFailed = (req, res, next) => {
  return res
    .status(400)
    .json({ msg: "Login Failed! Check email or password!" });
};
const login = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("User authenticated, session data:", req.session); // ✅ Check session

    res.on("finish", () => {
      console.log("Response headers:", res.getHeaders());
    });

    return res.json({ user: req.user });
  } else {
    return next(new UnauthorizedError("Unauthorized!!"));
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
      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          return next(new Error("Login failed"));
        } else {
          console.log("User logged in, session data:", req.session); // ✅ Check session
          res.cookie("connect.sid", req.sessionID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
          });

          res.redirect(`/api/v1/user/${user.id}`);
        }
      });
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
