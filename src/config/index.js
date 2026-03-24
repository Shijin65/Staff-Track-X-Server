const { transporter } = require("./emailConfig");
const { emailLogger } = require("./loggerConfig");

module.exports = {
  emailLogger,
  transporter,
};
