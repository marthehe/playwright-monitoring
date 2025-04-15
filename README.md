# 🌐 Synthetic Monitoring with Azure Functions & Playwright

This project sets up **synthetic availability monitoring** using:
- [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Playwright](https://playwright.dev/)
- [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

I built this solution while thinking about how unexpected login issues, expired secrets, or infrastructure misconfigurations can cause **user logins to silently fail**. These problems may not show up in basic health checks but can disrupt a live production experience — and the only signal might be a user complaint. I wanted to catch such issues proactively by simulating actual user logins, validating the UI experience, and getting alerts before any human notices.

---

## 🔧 What It Does

- Launches a headless browser using Playwright
- Navigates to a login page
- Enters username and password
- Waits for a dashboard element to confirm login success
- Logs result (`success: true` or `false`) to Application Insights
- Alerts me via email if a test fails

---

## ✅ Example Scenario

I test [https://www.saucedemo.com/](https://www.saucedemo.com/), a public site for UI automation demos.

### Scenario: Login Availability Test

```js
await page.goto('https://www.saucedemo.com/');
await page.fill('#user-name', 'standard_user');
await page.fill('#password', 'secret_sauce');
await page.click('#login-button');
await page.waitForSelector('.inventory_list', { timeout: 5000 });
```

If the login works → log `success: true`  
If it fails → log `success: false` and send an alert

---

## 📦 How It Works

1. A **timer-triggered Azure Function** runs every 5 minutes
2. It uses **Playwright** to perform a simulated login
3. It logs results with `client.trackAvailability()` to Application Insights
4. An **alert rule** watches for `availability < 100%` and sends notifications

---

## 🚧 Problems I Encountered & How I Fixed Them

| Problem | Solution |
|--------|----------|
| `app.timer(...) is not supported` | Rewrote `index.js` to export the standard `module.exports = async function (...)` format |
| No data in `availabilityResults` | Fixed `.env` setup and added `APPLICATIONINSIGHTS_CONNECTION_STRING` in Azure App Settings |
| Playwright browser failed in Azure | Expected! Playwright needs extra setup for full browser use in Azure — this is OK for test failures |
| Alert didn't fire | Alert rule was too strict or had incorrect dimensions → simplified condition and removed filters |
| No email received | Notification group wasn't connected → created a new Action Group with email and linked it to the rule |

---

## 🚀 How to Run

```bash
npm install
func azure functionapp publish <your-function-name>
```

Make sure:
- `APPLICATIONINSIGHTS_CONNECTION_STRING` is set in Azure portal (Function App → Configuration)
- Your timer trigger is defined in `function.json`
- Alerts are set up under Azure Monitor → Alerts

---

## 📊 Monitoring Queries

Use this Kusto query to see results in Application Insights:

```kusto
availabilityResults
| where name == "SauceDemo Login Test"
| sort by timestamp desc
```

---

## ✉️ Alert Setup

You can create alerts from Application Insights to get notified when tests fail.  
The signal should be: `Availability`, with condition: `success < 100%`.

---

## 💡 Next Ideas

- Add more test scenarios (checkout, search, logout)
- Use Logic Apps to send alerts to Microsoft Teams
- Add Workbooks for visual dashboards

---

## 🌟 Inspiration & Credits

This project was inspired by the excellent blog post:

**[Synthetic Monitoring in Application Insights Using Playwright: A Game-Changer](https://techcommunity.microsoft.com/blog/AzureArchitectureBlog/synthetic-monitoring-in-application-insights-using-playwright-a-game-changer/4400509)**  
by **Anusha Malhotra**, with the original GitHub repo available at:  
🔗 [https://github.com/anu-01/AppInsights-Playwright](https://github.com/anu-01/AppInsights-Playwright)

The original solution introduced a great approach to replacing deprecated Azure Application Insights tests using Playwright + Azure Functions.

---

## 🛠️ What This Project Adds & Improves

This implementation builds on that foundation with a focus on:

- ✅ **Production-ready Azure Function format**  
  Replaced the `app.timer(...)` syntax (unsupported in deployed Azure Functions) with `module.exports`, making the function deployable and stable in cloud environments.

- ✅ **Full telemetry verification**  
  Confirmed `trackAvailability()` data flows into Application Insights using `availabilityResults`, with working Kusto queries.

- ✅ **Complete alert pipeline**  
  Step-by-step setup of availability-based alert rules, tested with intentional failures and email notifications.

- ✅ **Troubleshooting and real-world fixes**  
  Includes guidance for solving missing functions in Azure, broken telemetry, connection string issues, and Playwright runtime challenges.

- ✅ **User-friendly README**  
  Added example scenarios, environment setup, testing steps, monitoring queries, alert configuration, and known issues — making the project easier to understand and adopt.

This version is designed for others to **clone, deploy, test, and expand** as a reusable pattern for UI-based synthetic monitoring.

---

🙌 Huge thanks to Anusha for the original concept and inspiration!

---

## 👩‍💻 Made with ☕ and 💙 by Marta

