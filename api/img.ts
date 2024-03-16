import express, { Request, Response } from "express";
import multer from "multer";
import mysql from 'mysql'
import { conn } from '../connectdb'
import path from "path";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebasecon";







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

router.get("/",(req, res)=>{
  res.send("testkub")
})

const fileUpload = new FileMiddleware();

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