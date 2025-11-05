// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadFolder = path.join(__dirname, "uploads");
// if(!fs.existsSync(uploadFolder)){
//   fs.mkdirSync(uploadFolder);
//   console.log("📁 Created uploads folder!");
// }
// const storage = multer.diskStorage({
//   destination: (req, file, cb)=>{
//     cb(null, uploadFolder);
//   },
//   filename: (req, file, cb)=>{
//     cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + "-" + path.extname(file.originalname));
//   }
// });

// const upload = multer({storage: storage});

// export default upload;  