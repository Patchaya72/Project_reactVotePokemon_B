import express from "express";
import { conn } from "../connectdb";
import { VotePostRequest } from "../model/votePostRequest";
import mysql from "mysql";

export const router = express.Router();


  ///เสร็จแล้ว  ดึงข้อมูลทั้งหมด
router.get('/', (req, res)=>{
  conn.query("select * from vote", (err, result, fields) => {
    res.json(result);
  });
});
       


 ///ค้นหา vote id    เสร็จแล้ว
router.get("/vote/:id", (req, res) => {
    if (req.query.id) {
      res.send("call get in Pictures with Query Param " + req.query.id);
    } else {
      conn.query(
        "select * from vote where ImgID = " + req.params.id,
        (err, result, fields) => {
          res.json(result);
        } 
      );
    }
  });  
 
  ///เพิ่ม vote   เสร็จแล้ว
  router.post("/add", (req, res) => {
    let vote: VotePostRequest = req.body;
    const currentDate: string = getCurrentDate();
  
    let sql = "INSERT INTO `vote`(`score`,`date`,`ImgID`) VALUES (?,?,?)";
  
    sql = mysql.format(sql, [vote.score,  currentDate ,vote.ImgID]);
  
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });
  //ดึงวันที่  เสร็จแล้ว
  function getCurrentDate(): string {
    const currentDate: Date = new Date();
    const day: number = currentDate.getDate();
    
    // สร้างสตริงเพื่อแสดงวันที่ในรูปแบบ "วัน/เดือน/ปี"
    const dateString: string = `${day}`;
     
    return dateString;
  }
    
  // เรียกใช้งานฟังก์ชัน getCurrentDate
  const currentDate: string = getCurrentDate();
  console.log(currentDate); // ผลลัพธ์: วันที่ปัจจุบัน "25"
  
///แก้ไข vote   เสร็จแล้ว
  router.put("/edit/:id", async (req, res) => {
    let id = +req.params.id;
    let vote: VotePostRequest = req.body;
  
    let sql =
      "update  `vote` set `score`=? where `ImgID`=? and `date`=?";
    sql = mysql.format(sql, [
        vote.score,
      id,
      currentDate,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res.status(201).json({ affected_row: result.affectedRows });
    });
  });
 
  /// ลบ vote  เสร็จแล้ว
  router.delete("/delete/:id", async (req, res) => {
    try {
        let id = +req.params.id;
        // สร้างคำสั่ง SQL สำหรับการลบข้อมูลโดยใช้ ID
        let sql = "DELETE FROM `vote` WHERE `ImgID`=?";
        sql = mysql.format(sql, [id]);
        
        // ส่งคำสั่ง SQL ไปยังฐานข้อมูล
        conn.query(sql, (err, result) => {
            if (err) throw err;
            // ตรวจสอบผลลัพธ์และส่งคำตอบกลับไปยังไคลเอ็นต์
            res.status(200).json({ message: `Deleted row with ID ${id}` });
        });
    } catch (error) {
        // หากมีข้อผิดพลาดในการประมวลผล
        res.status(500).json({ message: "Internal Server Error" });
    }
});