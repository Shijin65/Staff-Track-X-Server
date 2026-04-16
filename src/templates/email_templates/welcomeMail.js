const { response } = require("express");
const { transporter, emailLogger } = require("../../config");

const welcomeEmail = (user, jwtToken) => {
      const URL = process.env.FRONTEND_URL;
      const mailOptions = {
            from: `"Caters Hub" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Welcome to Caters Hub",
            html: `
                  <html>
                  <head>
                  <meta charset="UTF-8" />
                  <title>Welcome to Caters Hub</title>
                  </head>

                  <body style="margin:0; padding:0; background-color:#f4f7fb;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb; padding:20px 0;">
                  <tr>
                        <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; font-family:Arial, sans-serif; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                        <tr>
                              <td align="center" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); padding:40px 20px;">
                              <h1 style="color:#ffffff; margin:0; font-size:26px;">
                              Welcome to Caters Hub 🚀
                              </h1>
                              <p style="color:#ffffff; margin-top:10px; font-size:14px;">
                              Your journey starts here
                              </p>
                              </td>
                        </tr>

                        <tr>
                              <td style="padding:30px;">
                              <p style="font-size:15px; color:#333;">
                              Hi <strong>${user.firstName}</strong>,
                              </p>

                              <p style="font-size:14px; color:#555; line-height:1.6;">
                              Your account has been successfully created on <strong>Caters Hub</strong>.
                              To get started, please set your password using the button below.
                              </p>

                              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                              <tr>
                                    <td align="center">
                                    <a href="${URL}/auth/${jwtToken}" 
                                    style="background:#2563eb; color:#ffffff; padding:14px 28px; 
                                    text-decoration:none; border-radius:6px; font-weight:bold; 
                                    display:inline-block; font-size:14px;">
                                    Set Your Password
                                    </a>
                                    </td>
                              </tr>
                              </table>

                              <p style="font-size:13px; color:#777;">
                              This link will expire in <strong>48 hours</strong>.
                              </p>

                              <p style="font-size:13px; color:#777; line-height:1.6;">
                              If you did not request this account, you can safely ignore this email.
                              </p>
                              </td>
                        </tr>

                        <tr>
                              <td style="border-top:1px solid #e5e7eb;"></td>
                        </tr>

                        <tr>
                              <td style="padding:20px 30px; text-align:center;">
                              <p style="margin:0; font-size:13px; color:#555;">
                              Thanks,<br />
                              <strong style="color:#2563eb;">Team Caters Hub</strong>
                              </p>

                              <p style="margin-top:15px; font-size:11px; color:#999;">
                              © ${new Date().getFullYear()} Caters Hub. All rights reserved.
                              </p>
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
                        `Error sending welcome email: ${JSON.stringify({
                              error: error.message,
                              user: user.firstName + user.lastName,
                              to: user.email,
                              date: new Date(),
                        })}`
                  );
            } else {
                  emailLogger.info(
                        `Welcome email sent: ${JSON.stringify({
                              user: user.firstName + user.lastName,
                              to: user.email,
                              date: new Date(),
                        })}`
                  );
            }
      });
};

module.exports = welcomeEmail;
