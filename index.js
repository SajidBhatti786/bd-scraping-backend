import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // Import dotenv for environment variables

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000; // Use the PORT environment variable or default to 5000

// Enable CORS
// Enable CORS
const corsOptions = {
  origin: "https://bd-scraping-frontend-production.up.railway.app/", // Replace with your React app's origin
  optionsSuccessStatus: 200, // Some legacy browsers (IE) choke on 204
};

app.use(express.json());

let isScraping = false;
let scrapedData = [];

app.post("/api/scrape/start", (req, res) => {
  if (!isScraping) {
    isScraping = true;
    scrapedData = [];

    performWebScraping()
      .then((data) => {
        scrapedData = data;
        isScraping = false;
        res.status(200).json({ message: "Scraping completed", data: scrapedData });
      })
      .catch((error) => {
        console.error("Scraping failed:", error);
        isScraping = false;
        res.status(500).json({ message: "Scraping failed" });
      });
  } else {
    res.status(400).json({ message: "Scraping is already in progress" });
  }
});

app.post("/api/scrape/stop", (req, res) => {
  isScraping = false;
  res.status(200).json({ message: "Scraping stopped" });
});

app.get("/api/scrape/data", (req, res) => {
  res.status(200).json(scrapedData);
});

// Graceful server shutdown
process.on("SIGINT", () => {
  console.log("Server shutting down...");
  // You can add cleanup logic here if needed
  process.exit(0);
});

app.listen(port,"0.0.0.0", function() {
  console.log(`Server is running on port ${port}`);
});
