import cors from "cors";
import csvParser from "csv-parser";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const app = express();
const port = 3000;

app.use(cors({
   origin: "http://localhost:4000",
   methods: "GET, POST"
}));

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "uploads");
   },
   filename: function (req, file, cb) {
      cb(null, file.originalname);
   }
});

const upload = multer({ storage });

app.use(express.json());
let data: any[];

app.post("/api/files", upload.single("file"), (req, res) => {
   if (!req.file) {
      return res.status(400).json({ error: "No files were sent!" })
   }


   const csvFilePath = path.join(__dirname, "../uploads", req.file.filename);
   data = []

   fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
         console.log("Row data", row)
         data.push(row);
      })
      .on("end", () => {
         fs.unlinkSync(csvFilePath);

         res.status(200).json({ message: "The file was uploaded successfully.", data })
      })
      .on("error", (error) => {
         console.error("CSV processing error:", error);
         res.status(500).json({ message: "Internal server error while processing CSV!" })
      })
});

app.get("/api/users", (req, res) => {
   const searchTerm = req.query.q?.toString().toLowerCase();
   if (!searchTerm) {
      return res.status(400).json({ error: "Query parameter not provided!" })
   }

   const filteredData = data.filter((row: { some: (arg0: (value: any) => any) => { [s: string]: unknown; } | ArrayLike<unknown>; }) => {
      return Object.values(row).some((value) =>
         value.toString().toLowerCase().includes(searchTerm)
      );
   });

   if (filteredData.length === 0) {
      return res.status(200).json({ message: "No results found!" });
   };

   res.status(200).json({ data: filteredData });
});

app.listen(port, () => {
   console.log(`Server On in port: ${port}`)
});

export default app;
