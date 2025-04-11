// Import the Azure Functions library
// This gives us access to Azure Functions bindings and setup methods
const { app } = require("@azure/functions");

// Import the custom function we created to run Playwright tests
// This will be the function that opens a browser and runs the login test
const { runPlaywrightTests } = require("../playwrightTest.js");

// Register a new Timer Trigger Function called 'timerTrigger1'
app.timer("timerTrigger1", {
  // This is the schedule expression: '0 */5 * * * *'
  // It means: run every 5 minutes (in CRON format)
  schedule: "0 */5 * * * *",

  // This is the handler function that gets executed on each run
  handler: async (myTimer, context) => {
    try {
      // Log that we're starting the test
      context.log("Running Playwright test...");

      // Call the Playwright test function (opens browser, logs in, tracks results)
      await runPlaywrightTests(context);

      // Log that the test finished successfully
      context.log("Test complete!");
    } catch (error) {
      // If something goes wrong, log the error to the Azure Function logs
      context.log.error("Test error:", error);
    }
  },
});
