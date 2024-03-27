import express, { Request, Response } from "express";
import multer from "multer";
import mysql from 'mysql'
import { conn } from '../connectdb'
import path from "path";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebasecon";
import { PicturePostRequest } from "../model/picturePostRequest";







export const router = express.Router();

class FileMiddleware {
  //Attribute of class
  filename = "";
  //Attribute diskloader for saving file to disk
  public readonly diskLoader = multer({
    // storage = saving file to memory
    storage: multer.memoryStorage(),
    // limit file size
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();


router.get("/", (req, res) => {
  conn.query("select * from img", (err, result, fields) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  if (req.query.id) {
    res.send("call get in Pictures with Query Param " + req.query.id);
  } else {
    conn.query(
      "select * from Pictures where id = " + req.params.id,
      (err, result, fields) => {
        res.json(result);
      }
    );
  }
  //   res.json("this is Users page")
});


router.get("/uid/:id", (req, res) => {
  if (req.query.id) {
    res.send("call get in Pictures with Query Param " + req.query.id);
  } else {
    conn.query(
      "select * from img where Uid = " + req.params.id,
      (err, result, fields) => {
        res.json(result);
      }
    );
  }
}); 
 
router.post("/add", (req, res) => {
  let score=0;
  let picture: PicturePostRequest = req.body;
  let sql = "INSERT INTO `img`(`Uid`,`name`,`path`,`score`) VALUES (?,?,?,?)";

  sql = mysql.format(sql, [picture.Uid,  picture.name ,picture.path,score]);

  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});


router.post(
  "/",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    console.log("File "+req.file);
    
    try {
      // upload รูปภาพลง firebase โดยใช้ parameter ที่ส่งมาใน URL path
      const url = await firebaseUpload(req.file!);
      res.send("Image: " + url);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).send("Failed to upload image");
    }
    
  }
);

///แก้ไข img   เสร็จแล้ว
router.put("/edit/:id", async (req, res) => {
  let id = +req.params.id;
  let vote: PicturePostRequest = req.body;

  let sql =
    "update  `img` set `score`=? where `id`=? ";
  sql = mysql.format(sql, [
      vote.score,
    id,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows });
  });
});

async function firebaseUpload(file: Express.Multer.File) {
  // Upload to firebase storage
  const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
  // Define locations to be saved on storag
  const storageRef = ref(storage, "/images/" + filename);
  // define file detail
  const metaData = { contentType: file.mimetype };
  // Start upload
  const snapshost = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metaData
  );
  // Get url image from storage
  const url = await getDownloadURL(snapshost.ref);

  return url;
}

router.get("/rankYesterday/get", (req, res) => {
  conn.query(
    `SELECT img.name, img.path, img.id, vote.score ,vote.date
    FROM vote
    JOIN img ON vote.ImgID = img.id
    WHERE  vote.date = DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%d')
    AND img.id NOT IN (
        SELECT img.id
        FROM vote
        JOIN img ON vote.ImgID = img.id
        WHERE vote.date = DATE_FORMAT(NOW() ,'%d')
        GROUP BY img.id
    )
    ORDER BY vote.score DESC;
    `,
    (err, result, fields) => {
      res.status(200).json(result);
    }
  );
});

router.get("/rankToday/get", (req, res) => {
  conn.query(
    `SELECT img.name, img.path, img.id, vote.score ,vote.date
    FROM vote
    JOIN img ON vote.ImgID = img.id
    WHERE vote.date = DATE_FORMAT(NOW(), '%d')
    OR vote.date = DATE_FORMAT(NOW() - INTERVAL 1 DAY, '%d')
    AND img.id NOT IN (
        SELECT img.id
        FROM vote
        JOIN img ON vote.ImgID = img.id
        WHERE vote.date = DATE_FORMAT(NOW(), '%d')
        GROUP BY img.id
    )
    ORDER BY vote.score DESC;
    `,
    (err, result, fields) => {
      res.status(200).json(result);
    }
  );
});

router.get("/Graph/:id", (req, res) => {
  let id = +req.params.id;
  conn.query(
    `SELECT
      vote.id, vote.score, vote.ImgID, vote.date
    FROM
      vote
    WHERE
      vote.ImgID = ? AND
      vote.date >= DATE_FORMAT(NOW() - INTERVAL 7 DAY, '%d')
    ORDER BY
      vote.date
    LIMIT 7;`,
    [id],
    (err, result, fields) => {
      if (err) { 
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.json(result);
    }
  );
});




