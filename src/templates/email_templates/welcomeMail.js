const { response } = require("express");
const { transporter, emailLogger } = require("../../config");

const welcomeEmail = (user, jwtToken) => {
  const URL = process.env.FRONTEND_URL;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Welcome to Nexus",
    html: `
     <html>
      <head>
            <title>Welcome to Nexus</title>
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
                                                      Welcome to Nexus!
                                                </h1>
                                          </td>
                                    </tr>
                                    <tr><td style="border-bottom:2px solid #c1d42f; padding:2px"></td></tr>
                                    <tr>
                                          <td style="padding:30px;">
                                                <p style="font-size:14px; color: #717171; text-align: justify; line-height: 1.5;">
                                                      Hello ${user.firstName},
                                                      <br />
                                                      <br />
                                                      Welcome to Nexus ! An account has been created with your mail id within the Nexus platform.
                                                      <br />
                                                   
                                                      <p style="font-size:14px; color: #717171; text-align: justify; line-height: 1.5;">To set up your password, please click the provided link:  <br /> <br/><a style="color:#ff7e00; padding:10px; border:1px solid #FF8800; border-radius:4px; font-weight:bold; text-decoration:none; background-color:#f2e8dc" href="${URL}/auth/${jwtToken}">Click here to set a new password</a></p>  <br/><br/>
                                                      <p style="font-size:14px; color: #717171; text-align: justify; ">This link will remain active and valid for the <span style="font-weight:bold">next 48 hours</span>.</p>
                                                     
                                               
                                          </td>
                                    </tr>
                                    <tr>
                                          <td style="padding-left:30px; padding-right:30px; padding-top:0px;">
                                                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-family:Arial,sans-serif;">
                                                    <tr>
                                                      <td align="left">
                                                            <p style="font-size: 14px; color: #717171; ">
                                                                  Thank You,
                                                            </p>
                                                            <h1 style="margin:0;font-size:16px;line-height:16px;font-family:Arial,sans-serif;">
                                                                  <span style="color:#93a219;">Team Nexus</span>
                                                            </h1> <br />
                                                             <p style="font-size:.8rem; color: #515151; line-height: 1.5; background-color:#f4e6b7; padding:10px; text-align:center;">If you have not initiated this account creation, kindly disregard this email.</p>
                                                            <br/>
                                                             <br/>
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
