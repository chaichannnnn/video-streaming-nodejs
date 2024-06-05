const express = require("express");
const app = express();
const fs = require("fs");

const port = 3000;

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
  const range = req.headers.range;
//   if (!range) {
//     res.status(400).send("Requires Range header");
//   }
  const videoPath = "video.mp4";
  const videoSize = fs.statSync(videoPath).size;

  //คำนวณขนาดของชิ้น (chunk) ที่จะส่งไป โดยเริ่มจากตำแหน่ง start ที่ได้จาก Range header
  //และสิ้นสุดที่ end โดยขนาดเราสามารถกำหนดได้ โดยตัวอย่างนี้จะอยู่ที่ชิ้นละ 1MB
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  //สร้าง headers ที่จำเป็นในการส่ง Response ไปยัง Client
  //โดยใช้ Status Code เป็น 206 ซึ่งหมายถึง Partial Content แบบว่าเนื้อหายังไม่ครบ ยังมีต่อนะ
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  //สร้าง stream สำหรับวิดีโอจากตำแหน่ง start ถึง end แล้วทำการส่ง stream นั้นไปยังไคลเอ็นต์
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}!`);
});



// const express = require("express");
// const fs = require("fs");

// const app = express();
// const port = 3000;

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

// app.get("/video", (req, res) => {
//   const videoPath = "Teaser-Biggie-EP5.mp4";
//   const stat = fs.statSync(videoPath);
//   const fileSize = stat.size;
//   const range = req.headers.range;

//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-");
//     const start = parseInt(parts[0], 10);
//     const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     const chunkSize = end - start + 1;

//     const file = fs.createReadStream(videoPath, { start, end });
//     const head = {
//       "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//       "Accept-Ranges": "bytes",
//       "Content-Length": chunkSize,
//       "Content-Type": "video/mp4",
//     };

//     res.writeHead(206, head);
//     file.pipe(res);
//   } else {
//     const head = {
//       "Content-Length": fileSize,
//       "Content-Type": "video/mp4",
//     };
//     res.writeHead(200, head);
//     fs.createReadStream(videoPath).pipe(res);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
