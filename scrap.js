import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function performWebScraping(sendDataCallback) {
  console.log("performing web scraping");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    console.log("try");
    await driver.get("https://www.bookdepot.com/Store/Categories");
    const subjectsSections = await driver.findElements(
      By.xpath("//h5[text()='Subjects']")
    );
    console.log("got to book depot");

    let categoryLinks = [];

    try {
      for (const subjectsSection of subjectsSections) {
        const categoryTags = await subjectsSection
          .findElement(By.xpath("./following-sibling::p"))
          .findElements(By.tagName("a"));

        for (const categoryTag of categoryTags) {
          const categoryHref = await categoryTag.getAttribute("href");
          categoryLinks.push(categoryHref);
        }
      }

      categoryLinks.length
        ? console.log(
            "got category links in try " +
              categoryLinks.length +
              " categories found"
          )
        : console.log("no category links in try");
    } catch (e) {
      console.log("error finding categories");
    }

    console.log("got category links");
    const scrapedData = [];

    for (const categoryLink of categoryLinks) {
      console.log("in Loop");
      // Check if the URL starts with the base URL, and if not, concatenate it
      const categoryURL = categoryLink.startsWith("https://www.bookdepot.com/")
        ? categoryLink
        : "https://www.bookdepot.com/" + categoryLink;

      await driver.get(categoryURL);

      // Extract product details for each category
      const productElements = await driver.findElements(
        By.className("grid-item")
      );

      for (const productElement of productElements) {
        const product = {};

        try {
          const titleElement = await productElement.findElement(By.css("h2 a"));
          product["Title"] = await titleElement.getText();
          console.log("title: ", product["Title"]);
        } catch (e) {
          product["Title"] = "Title not found";
        }
        try {
          const authorElement = await productElement.findElement(
            By.css("h2 + a")
          );
          product["Author"] = await authorElement.getText();
          console.log("Author: ", product["Author"]);
        } catch (e) {
          product["Author"] = "Author not found";
        }
        try {
          const publisherElement = await productElement.findElement(
            By.css("h2 + a+ span a")
          );
          product["Publisher"] = await publisherElement.getText();
          console.log("Publisher: ", product["Publisher"]);
        } catch (e) {
          product["Publisher"] = "Publisher not found";
        }
        try {
          const formatElement = await productElement.findElement(
            By.css("h2+a+span+span a")
          );
          product["Format"] = await formatElement.getText();
          console.log("format: ", product["Format"]);
        } catch (e) {
          product["Format"] = "Format not found";
        }
        try {
          const categoryElement = await productElement.findElement(
            By.css("h2+a+span+span+br+span a")
          );
          product["Category"] = await categoryElement.getText();
          console.log("Category: ", product["Category"]);
        } catch (e) {
          product["Category"] = "Category not found";
        }
        try {
          const priceInfoElement = await productElement.findElement(
            By.className("dropdown")
          );
          const priceInfo = await priceInfoElement.getText();

          const priceSplit = priceInfo.split("\n");
          if (priceSplit.length >= 2) {
            product["Price"] = priceSplit[0];
            const listPriceSplit = priceSplit[1].split("- Qty:");
            if (listPriceSplit.length >= 2) {
              const listPrice = listPriceSplit[0].trim().split(": ")[1];
              product["List Price"] = listPrice;
            } else {
              product["List Price"] = "List Price not found";
            }
          } else {
            product["Price"] = "Price not found";
            product["List Price"] = "List Price not found";
          }
        } catch (e) {
          product["Price"] = "Price not found";
          product["List Price"] = "List Price not found";
        }

        try {
          const isbnElement = await productElement.findElement(
            By.xpath(".//span[contains(text(), 'ISBN:')]")
          );
          const isbnText = await isbnElement.getText();
          const isbn = isbnText.replace(/\D/g, ""); // Extract only numeric characters
          product["ISBN"] = isbn || "ISBN not found";
        } catch (e) {
          product["ISBN"] = "ISBN not found";
        }

        // (Repeat similar try-catch blocks for other product details)

        scrapedData.push(product);
      }
    }

    return scrapedData;
  } finally {
    await driver.quit();
  }
}
