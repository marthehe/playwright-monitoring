// Load environment variables from .env file
// This makes your App Insights connection string available via process.env
require("dotenv").config();

// Import Playwright library for browser automation
const playwright = require("playwright");

// Import Azure Application Insights SDK for sending telemetry data
const appInsights = require("applicationinsights");

// Set up Application Insights with your connection string from .env
appInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) // Connect to your App Insights resource
  .setSendLiveMetrics(true) // Enable live metrics in Azure
  .setAutoCollectRequests(true) // Automatically collect incoming HTTP requests (not critical here, but good practice)
  .setAutoCollectPerformance(true) // Collect performance counters like memory/CPU usage
  .setAutoCollectDependencies(true) // Automatically track external dependencies (e.g. APIs)
  .setAutoCollectExceptions(true) // Automatically capture unhandled exceptions
  .start(); // Start the telemetry client

// Get the default client used to send telemetry data
const client = appInsights.defaultClient;

// Define your test function (to be called from the Azure Function trigger)
async function runPlaywrightTests(context) {
  try {
    // Log to console/logs that the test is starting
    context.log("Starting login test...");

    // Launch a headless Chromium browser (runs in the background, no UI)
    const browser = await playwright.chromium.launch({ headless: true });

    // Open a new browser tab
    const page = await browser.newPage();

    // Navigate to the test website
    await page.goto("https://www.saucedemo.com/");

    // Fill the username field with a test username
    await page.fill("#user-name", "standard_user");

    // Fill the password field with a test password
    await page.fill("#password", "secret_sauce");

    // Click the login button
    await page.click("#login-button");

    // Wait for a selector that confirms successful login (the product list)
    //await page.waitForSelector(".inventory_list", { timeout: 5000 });
    await page.waitForSelector(".this_selector_does_not_exist", {
      timeout: 5000,
    });

    // If everything worked, send a success availability result to App Insights
    client.trackAvailability({
      name: "SauceDemo Login Test", // Test name
      success: true, // Test passed
      duration: 5000, // (Optional) Simulated duration in ms
      runLocation: "Azure Function", // Custom field to show where the test was run
      message: "Login success", // Custom message
      time: new Date(), // Timestamp of the test run
    });

    // Log to console/logs that the test succeeded
    context.log("✅ Login succeeded");

    // Close the browser
    await browser.close();
  } catch (error) {
    // If anything fails, log the error message
    context.log.error("❌ Login failed:", error.message);

    // Send a failure result to Application Insights
    client.trackAvailability({
      name: "SauceDemo Login Test", // Test name
      success: false, // Test failed
      duration: 0, // No duration since it failed
      runLocation: "Azure Function",
      message: error.message, // Show the error that caused the failure
      time: new Date(),
    });
  }
}

// Export the function so it can be imported in timerTrigger1.js
module.exports = { runPlaywrightTests };
