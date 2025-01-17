const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto"); // for generating random license keys

const app = express();
app.use(bodyParser.json());

// Fake in-memory store: in production, use a real DB
const licenses = {};

/**
 * Endpoint to generate a license key after a successful subscription
 */
app.post("/generate_license", (req, res) => {
  const { email, subscriptionId } = req.body;

  // Generate a random license key
  const licenseKey = crypto.randomBytes(16).toString("hex");

  // Store or associate license with user
  licenses[email] = {
    licenseKey,
    subscriptionId,
    active: true,
  };

  // Return the license key to the caller
  res.json({
    licenseKey,
  });
});

/**
 * Endpoint to validate the license (to be called by the CLI or any client)
 */
app.get("/validate_license", (req, res) => {
  const { licenseKey, email } = req.query; 

  if (!licenseKey || !email) {
    return res
      .status(400)
      .json({ valid: false, reason: "Missing licenseKey or email" });
  }

  // Check if the license exists and is active
  const userLicense = licenses[email];
  if (userLicense && userLicense.licenseKey === licenseKey && userLicense.active) {
    // Optionally, check subscription status with Outseta
    // If subscription is canceled, mark active = false
    // For now, assume it's active
    return res.json({ valid: true });
  } else {
    return res.json({ valid: false });
  }
});

/**
 * Start server on port 3000 (or a provided port if in a hosting environment)
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`License server running on port ${PORT}`);
});
