// Import the Playwright test function we created in playwrightTest.js
// This function will run a browser, perform the login test, and send results to Application Insights
const { runPlaywrightTests } = require("../playwrightTest");

// Export the main function so Azure Functions can run it
// This is a timer-triggered function that runs on a schedule (defined in function.json)
module.exports = async function (context, myTimer) {
  try {
    // Log to the Azure Function runtime that the trigger started
    context.log("🟢 Timer trigger activated!");

    // Run the Playwright test and wait for it to finish
    await runPlaywrightTests(context);

    // If the test ran without throwing an error, log success
    context.log("✅ Test complete!");
  } catch (error) {
    // If something went wrong during the test, log the error
    // This will help with debugging and also appears in Application Insights
    context.log.error("❌ Error running Playwright test:", error.message);
  }
};
