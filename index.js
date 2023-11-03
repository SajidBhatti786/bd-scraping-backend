import express from "express";
import cors from "cors";
const app = express();
const port = 5000;
import { performWebScraping } from "./scrap.js";

// Enable CORS
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your React app's origin
  optionsSuccessStatus: 200, // Some legacy browsers (IE) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Store the scraping state (running or not)
let isScraping = false;

// Scraped data storage
let scrapedData = [];

/// Start scraping
app.post("/api/scrape/start", (req, res) => {
  console.log("started scrape");
  if (!isScraping) {
    // Set the scraping state to running
    isScraping = true;
    scrapedData = []; // Clear previous data

    // Start scraping logic here (similar to your previous scraping code)
    performWebScraping()
      .then((data) => {
        scrapedData = data;
        isScraping = false; // Set scraping state to not running
        res
          .status(200)
          .json({ message: "Scraping completed", data: scrapedData });
      })
      .catch((error) => {
        console.error("Scraping failed:", error);
        isScraping = false; // Set scraping state to not running
        res.status(500).json({ message: "Scraping failed" });
      });
  } else {
    res.status(400).json({ message: "Scraping is already in progress" });
  }
});

// Stop scraping
app.post("/api/scrape/stop", (req, res) => {
  isScraping = false; // Set scraping state to not running
  res.status(200).json({ message: "Scraping stopped" });
});

// Get scraped data
app.get("/api/scrape/data", (req, res) => {
  res.status(200).json(scrapedData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
