import sql from "../db/sql.js";
import { UnauthorizedError } from "../errors/index.js";

const getCurrentUser = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  return next(new UnauthorizedError("Unauthorized!"));
};

const getUser = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const { userID } = req.params;
    const user = await sql(
      "SELECT first_name,last_name, email, id FROM users WHERE id =$1",
      [userID]
    );
    if (user.length) {
      return res.json({ user: user[0] });
    } else {
      return res.json({ msg: `Can't find the user with id ${userID}` });
    }
  }
  return next(new UnauthorizedError("Unauthorized!"));
};
const updateUserDetails = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const { userID } = req.params;
    const user = await sql("SELECT * FROM users WHERE id =$1", [userID]);
    if (user.length) {
      const { firstName, lastName, email } = req.body;
      const updatedUser = await sql(
        "UPDATE users set first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, first_name, last_name, email",
        [firstName, lastName, email, userID]
      );
      return res.json({ user: updatedUser[0] });
    } else {
      return res.json({ msg: `Can't find the user with id ${userID}` });
    }
  }
  return next(new UnauthorizedError("Unauthorized!"));
};
const deleteUser = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const { userID } = req.params;
    const user = await sql(
      "SELECT first_name,last_name, email FROM users WHERE id =$1",
      [userID]
    );
    if (user.length) {
      await sql("DELETE FROM users WHERE id = $1", [userID]);
      return res.json({ msg: "User Deleted Successfully!!" });
    } else {
      return res.json({ msg: `Can't find the user with id ${userID}` });
    }
  }
  return next(new UnauthorizedError("Unauthorized!"));
};

export { getUser, deleteUser, updateUserDetails, getCurrentUser };
