import express from "express";
import { conn } from "../connectdb";
import { UserPostRequest } from "../model/userPostRequest";
import mysql from "mysql";
import util from "util";

export const router = express.Router();



 
router.get("/", (req, res) => {
  conn.query("select * from User", (err, result, fields) => {
    res.json(result);
  });
});


  

router.get("/:id", (req, res) => {
    conn.query(
      "select * from User where id = " +req.params.id,
      (err, result, fields) => {
        res.json(result);
      }
    );
  }
  //   res.json("this is Users page")
  );


router.post("/",(req, res) => {
  //upload รูปภาพลง firebase
  //เก็บข้อมูลลง database
  let user: UserPostRequest = req.body;
  // let sql =
  //   "INSERT INTO `User`(`name`, `email`, `password`,`profile`,`role`) VALUES (?,?,?,?,?)";

  let sql =  "INSERT INTO User set ?";

  // sql = mysql.format(sql,user);

  conn.query(sql,user, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});
  

router.put("/edit/:id", async (req, res) => {
  let id = +req.params.id;
  let user: UserPostRequest = req.body;
  let userOriginal: UserPostRequest | undefined;
  const queryAsync = util.promisify(conn.query).bind(conn);

  let sql = mysql.format("select * from User where id = ?", [id]);

  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  console.log(rawData);
  userOriginal = rawData[0] as UserPostRequest;
  console.log(userOriginal); 

  let updateUser = { ...userOriginal, ...user };
  console.log(user);
  console.log(updateUser);

  sql =
    "update  `User` set `name`=?, `email`=?, `password`=?, `profile`=? where `id`=?";
  sql = mysql.format(sql, [
    updateUser.name,
    updateUser.email,
    updateUser.password,
    updateUser.profile,
    id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows });
  });
});