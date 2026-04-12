const { transporter, emailLogger } = require("../../config");

const resetPasswordEmail = (user, password, jwtToken) => {
  const URL = process.env.FRONTEND_URL;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Password Reset Request - StaffManagement",
    html: `
<html>
        <head>
          <title>Password Reset Request</title>
          <style>
            table, td, div, h1, p {
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body style="margin:0;padding:0;">
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
            <tr>
              <td align="center" style="padding:0;">
                <table role="presentation" style="width:602px;border-collapse:collapse;border-spacing:0;text-align:left; background:#f2f2f2; font-size:14px">
                  <tr>
                    <td align="center" style="padding:60px 10px 30px 10px; background-color:#93a219; text-transform: uppercase;">
                      <h1 style="font-size:24px;font-family:Arial,sans-serif;color:#ffffff; text-align:center;">
                        Password Reset Request
                      </h1>
                    </td>
                  </tr>
                  <tr><td style="border-bottom:2px solid #c1d42f; padding:2px"></td></tr>
                  <tr>
                    <td style="padding:30px;">
                      <p style="font-size:14px; color: #717171; text-align: justify; line-height: 1.5;">
                        Dear ${user.firstName} ${user.lastName},
                        <br /><br />
                        We received a request to reset the password for your account on the StaffManagement platform.
                        <br /><br />
                        To reset your password, please click the link below to access the password reset page:
                        <br /><br />
                        <a href="${URL}/auth/${jwtToken}" style="color:#ff7e00; padding:10px; border:1px solid #FF8800; border-radius:4px; font-weight:bold; text-decoration:none; background-color:#f2e8dc">Click here to reset a new password</a>
                        <br /><br />
                        For your security, please use the temporary credentials provided below to log in:
                        <br /><br />
                        <strong>Email:</strong> ${user.email}
                        <br />
                        <strong>Temporary Password:</strong> ${password}
                        <br /><br />
                        Once you log in, we highly recommend changing your password immediately for added security.
                        <br />
                        
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-family:Arial,sans-serif;padding-bottom:25px">
                          <tr>
                        <td style="padding-left:30px; padding-right:30px; padding-top:0px;">
                          <p style="font-size:14px;  color: #717171; line-height: 1.5;">
                            Thank you,
                          </p>
                          <h1 style="margin:0;font-size:16px;line-height:16px;font-family:Arial,sans-serif;">
                            <span style="color:#799431;">StaffManagement Team</span>
                          </h1> <br />
                            <p style="font-size:.8rem; color: #515151; line-height: 1.5; background-color:#f4e6b7; padding:10px; text-align:center;">If you did not request a password reset, please disregard this email. Your account remains secure, and no further action is required.</p>
                        </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      emailLogger.error(
        `Error sending password reset email: ${JSON.stringify({
          error: error.message,
          user: user.firstName + user.lastName,
          to: user.email,
          date: new Date(),
        })}`
      );
    } else {
      emailLogger.info(
        `${mailOptions.subject}: ${JSON.stringify({
          user: user.firstName + user.lastName,
          to: user.email,
          date: new Date(),
        })}`
      );
    }
  });
};

module.exports = resetPasswordEmail;
