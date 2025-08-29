export function getEmailTemplate({ subject, message }: { subject: string; message: string }) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f8fafc; color: #222; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }
          .header { background: #facc15; color: #222; padding: 16px; border-radius: 8px 8px 0 0; font-size: 24px; font-weight: bold; text-align: center; }
          .content { padding: 24px 0; font-size: 16px; }
          .footer { color: #888; font-size: 13px; text-align: center; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Automated AI trades</div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Automated AI trades. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}
