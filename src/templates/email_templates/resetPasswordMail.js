const { transporter, emailLogger } = require("../../config");

const resetPasswordEmail = (user, password, jwtToken) => {
  const URL = process.env.FRONTEND_URL;
  const mailOptions = {
    from: `"Caters Hub" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Password Reset Request - Caters Hub",
    html: `
        <html>
        <head>
          <meta charset="UTF-8" />
          <title>Change Password</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f7fb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb; padding:20px 0;">
            <tr>
              <td align="center">

                <!-- Card -->
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; font-family:Arial, sans-serif; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td align="center" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); padding:40px 20px;">
                      <h1 style="color:#ffffff; margin:0; font-size:24px;">
                        Change Your Password 🔐
                      </h1>
                      <p style="color:#dbeafe; margin-top:10px; font-size:14px;">
                        Secure your account access
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:30px;">
                      <p style="font-size:15px; color:#333;">
                        Hi <strong>${user.firstName} ${user.lastName}</strong>,
                      </p>

                      <p style="font-size:14px; color:#555; line-height:1.6;">
                        We received a request to change your password. Click the button below to proceed.
                      </p>

                      <!-- CTA -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                        <tr>
                          <td align="center">
                            <a href="${URL}/auth/${jwtToken}" 
                              style="background:#2563eb; color:#ffffff; padding:14px 28px; 
                              text-decoration:none; border-radius:6px; font-weight:bold; 
                              display:inline-block; font-size:14px;">
                              Change Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Temp Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:15px; margin:20px 0;">
                        <tr>
                          <td style="font-size:13px; color:#333;">
                            <strong>Temporary Login Details:</strong><br /><br />
                            Email: ${user.email}<br />
                            Temporary Password: <strong>${password}</strong>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size:13px; color:#777;">
                        This link will expire soon. For security reasons, please update your password immediately after logging in.
                      </p>

                      <p style="font-size:13px; color:#777; line-height:1.6;">
                        If you didn’t request this, you can ignore this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="border-top:1px solid #e5e7eb;"></td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 30px; text-align:center;">
                      <p style="margin:0; font-size:13px; color:#555;">
                        Regards,<br />
                        <strong style="color:#2563eb;">Caters Hub Team</strong>
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
        </html>`
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
