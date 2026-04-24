const { transporter, emailLogger } = require("../../config");

const sendOtpEmail = (user, otp) => {
  const mailOptions = {
    from: `"Caters Hub" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "One Time Password - Caters Hub",

        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <title>Verify Your OTP</title>
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
                          OTP Verification 🔐
                        </h1>
                        <p style="color:#dbeafe; margin-top:10px; font-size:14px;">
                          Secure access to your account
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:30px;">
                        <p style="font-size:15px; color:#333;">
                          Hi <strong>\${user.firstName}</strong>,
                        </p>

                        <p style="font-size:14px; color:#555; line-height:1.6;">
                          Use the One-Time Password (OTP) below to complete your verification process.
                        </p>

                        <!-- OTP BOX -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                          <tr>
                            <td align="center">
                              <div style="
                                display:inline-block;
                                background:#eff6ff;
                                border:2px dashed #2563eb;
                                padding:18px 30px;
                                border-radius:8px;
                                font-size:28px;
                                letter-spacing:8px;
                                font-weight:bold;
                                color:#1e3a8a;
                              ">
                                ${otp}
                              </div>
                            </td>
                          </tr>
                        </table>

                        <p style="font-size:13px; color:#777;">
                          This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.
                        </p>

                        <p style="font-size:13px; color:#777; line-height:1.6;">
                          If you didn’t request this, you can safely ignore this email.
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
                          <strong style="color:#2563eb;">Team Nexus</strong>
                        </p>

                        <p style="margin-top:15px; font-size:11px; color:#999;">
                          © \${new Date().getFullYear()} Nexus. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>
          </body>
          </html>
          `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      emailLogger.error(

        `Error sending OTP email: ${JSON.stringify({
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

module.exports = sendOtpEmail;
