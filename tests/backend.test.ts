import request from "supertest";
import app from "../src/app";
import multerConfig from "../src/multerConfig";

describe("POST /api/files", () => {
   it("should upload a CSV file", async () => {
      const fileContent = `name,city,country,favorite_sport
      John Doe,New York,USA,Basketball
      Jane Smith,London,UK,Football
      Mike Johnson,Paris,France,Tennis
      Karen Lee,Tokyo,Japan,Swimming
      Tom Brown,Sydney,Australia,Running
      Emma Wilson,Berlin,Germany,Basketball`;

      const fileName = "test.csv";
      const fileBuffer = Buffer.from(fileContent, "utf-8")

      const simulatedFile = {
         buffer: () => fileBuffer,
         mimetype: "text/csv",
         originalname: fileName
      }

      const upload = multerConfig.single("file");

      const response = await request(app)
         .post("/api/files")
         .attach("file", simulatedFile.buffer(), {
            filename: simulatedFile.originalname,
            contentType: simulatedFile.mimetype,
         })
         .set("Content-Type", `multipart/form-data;`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("The file was uploaded successfully.");
      expect(response.body.data).toBeTruthy();
   });

   it("should return an error if no file is sent", async () => {
      const response = await request(app)
         .post("/api/files");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No files were sent!");
   })
});

describe("GET /api/users", () => {
   it("should return filtered data when a valid term is provided", async () => {
      const searchTerm = "John"

      const response = await request(app).get(`/api/users?q=${searchTerm}`);

      expect(response.status).toBe(200);
      expect(response.body.data);
      expect(response.body.message).toBeUndefined;
   });

   it("should return a message when no results are found for the search term", async () => {
      const searchTerm = "TermUndefined"

      const response = await request(app).get(`/api/users?q=${searchTerm}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeUndefined();
      expect(response.body.message).toBe("No results found!");
   });

   it("should return a error message when no search term is provided", async () => {
      const response = await request(app).get(`/api/users?q=`);

      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.error).toBe("Query parameter not provided!");
   });
})
