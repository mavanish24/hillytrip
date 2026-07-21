import nodemailer from 'nodemailer';

// Lazy loader for Transporter to avoid crashing on missing variables
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter !== null) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('[mailService.ts] SMTP is not fully configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS). Emails will log to the console.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
    console.log(`[mailService.ts] Nodemailer SMTP Transporter initialized successfully. (${host}:${port})`);
    return transporter;
  } catch (error) {
    console.error('[mailService.ts] Failed to initialize nodemailer transporter:', error);
    return null;
  }
}

/**
 * Core function to send email notification
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const mailTransporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || 'HillyTrip Support';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@hillytrip.com';

  if (!mailTransporter) {
    console.log('\n========================================================================');
    console.log(`✉️  [SIMULATED EMAIL DISPATCH]`);
    console.log(`👉 To:      ${to}`);
    console.log(`👉 Subject: ${subject}`);
    console.log(`👉 Body:`);
    console.log(text);
    console.log('========================================================================\n');
    return true;
  }

  try {
    const info = await mailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mailService.ts] Email sent successfully! MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[mailService.ts] Error occurred while sending email to ${to}:`, err);
    return false;
  }
}

/**
 * Templates for various booking events
 */
export function generateBookingNotificationEmail({
  lead,
  recipientRole,
  eventType,
  partnerContact = '',
  note = ''
}: {
  lead: any;
  recipientRole: 'customer' | 'partner';
  eventType: 'submitted' | 'accepted' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'info_requested';
  partnerContact?: string;
  note?: string;
}) {
  const isCustomer = recipientRole === 'customer';
  let title = '';
  let heading = '';
  let bodyParagraph = '';
  let actionCall = '';

  const detailsHtml = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; font-family: sans-serif;">
      <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Reference: #${lead.id}</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 140px;">Service Name:</td>
          <td style="padding: 6px 0;">${lead.homestayName || lead.cabDriverId ? 'Private Sightseeing Vehicle' : 'Custom Trip Package'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Lead Type:</td>
          <td style="padding: 6px 0; text-transform: capitalize;">${lead.leadType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Customer Name:</td>
          <td style="padding: 6px 0;">${lead.customerName}</td>
        </tr>
        ${lead.checkInDate ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Check-In Date:</td>
          <td style="padding: 6px 0;">${lead.checkInDate}</td>
        </tr>
        ` : ''}
        ${lead.checkOutDate ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Check-Out Date:</td>
          <td style="padding: 6px 0;">${lead.checkOutDate}</td>
        </tr>
        ` : ''}
        ${lead.numberOfGuests ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Guests Count:</td>
          <td style="padding: 6px 0;">${lead.numberOfGuests} Guests</td>
        </tr>
        ` : ''}
        ${lead.pickupLocation ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Pickup Location:</td>
          <td style="padding: 6px 0;">${lead.pickupLocation}</td>
        </tr>
        ` : ''}
        ${lead.dropLocation ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Drop Location:</td>
          <td style="padding: 6px 0;">${lead.dropLocation}</td>
        </tr>
        ` : ''}
        ${lead.specialRequest ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Special Request:</td>
          <td style="padding: 6px 0; font-style: italic; color: #64748b;">"${lead.specialRequest}"</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;

  switch (eventType) {
    case 'submitted':
      if (isCustomer) {
        title = `Booking Request Placed - #${lead.id}`;
        heading = `Your booking inquiry is on its way!`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>Your booking request has been successfully registered. The assigned local partner (<b>${lead.assignedPartnerName || 'Verified Partner'}</b>) has been notified and has 48 hours to respond. We'll update you as soon as they accept!`;
      } else {
        title = `New Booking Request Received - #${lead.id}`;
        heading = `You have received a new booking lead!`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>A new traveler booking request has been routed to your basecamp. Please review the traveler requirements and accept or reject the booking within 48 hours. Please note traveler contact info is masked until you accept!`;
        actionCall = `<p style="margin: 24px 0;"><a href="${process.env.APP_URL || 'http://localhost:3000'}/#/partner-dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Manage Booking Lead</a></p>`;
      }
      break;

    case 'accepted':
      if (isCustomer) {
        title = `Booking Request Accepted - #${lead.id}`;
        heading = `Great news! Your booking was accepted.`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>Your request has been approved by <b>${lead.assignedPartnerName || 'Partner'}</b>! You can now contact your host directly.<br/><br/><b>Host Direct Contact:</b> ${partnerContact}<br/>Feel free to call or WhatsApp them to coordinate the final arrangements.`;
        if (partnerContact) {
          const cleanContact = partnerContact.replace(/[^0-9]/g, '');
          actionCall = `<p style="margin: 24px 0;"><a href="https://wa.me/${cleanContact}" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">WhatsApp Host Directly</a></p>`;
        }
      } else {
        title = `You Accepted Booking Request - #${lead.id}`;
        heading = `Booking Lead Activated!`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>You have accepted the booking request. Customer contact details are now fully revealed:<br/><br/><b>Traveler Name:</b> ${lead.customerName}<br/><b>Traveler Phone:</b> ${lead.customerMobile}<br/><b>Traveler Email:</b> ${lead.customerEmail || 'Not specified'}<br/><br/>Please reach out to them to complete the confirmation process!`;
      }
      break;

    case 'confirmed':
      if (isCustomer) {
        title = `Booking Confirmed! - #${lead.id}`;
        heading = `Your trip is officially confirmed!`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>We are excited to let you know your booking for <b>${lead.homestayName || 'your travel package'}</b> is now officially confirmed. Get ready for an amazing Himalayan experience!`;
      } else {
        title = `Booking Confirmed - #${lead.id}`;
        heading = `Booking Confirmed!`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>Booking #${lead.id} is confirmed. Please prepare all accommodations/services for the customer's arrival!`;
      }
      break;

    case 'rejected':
      if (isCustomer) {
        title = `Booking Request Declined - #${lead.id}`;
        heading = `Booking Inquiry Declined`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>We regret to inform you that your booking request for #${lead.id} was declined by the partner (possibly due to prior occupancy or road closures). Feel free to explore other beautiful homestays or contact our custom planning desk!`;
      } else {
        title = `Booking Request Declined - #${lead.id}`;
        heading = `Inquiry Declined`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>You have declined booking request #${lead.id}. The customer has been notified and we will redirect them to other registered partners.`;
      }
      break;

    case 'cancelled':
      if (isCustomer) {
        title = `Booking Cancelled - #${lead.id}`;
        heading = `Booking Cancelled`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>Booking #${lead.id} has been cancelled. If this was an accident, please initiate a new booking request.`;
      } else {
        title = `Booking Cancelled - #${lead.id}`;
        heading = `Trip Cancelled`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>We want to inform you that booking #${lead.id} has been cancelled by the customer. No further preparation is required.`;
      }
      break;

    case 'completed':
      if (isCustomer) {
        title = `How was your trip? - #${lead.id}`;
        heading = `Your Himalayan Journey is Completed!`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>We hope you had a magical experience with <b>${lead.assignedPartnerName}</b>! Could you spare a moment to write a brief review? Your feedback helps keep HillyTrip authentic.`;
        actionCall = `<p style="margin: 24px 0;"><a href="${process.env.APP_URL || 'http://localhost:3000'}/#/profile" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Write a Review</a></p>`;
      } else {
        title = `Booking Completed - #${lead.id}`;
        heading = `Great work completing booking #${lead.id}!`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>This booking has been marked as completed. We have asked the explorer to rate their experience. Your earnings and contributions are updated!`;
      }
      break;

    case 'info_requested':
      if (isCustomer) {
        title = `Host Message Regarding Booking - #${lead.id}`;
        heading = `The host requested additional details`;
        bodyParagraph = `Hello ${lead.customerName},<br/><br/>The host has sent a message regarding your booking request:<br/><br/><div style="padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; font-style: italic;">"${note}"</div><br/>Please reach out to the host or respond to arrange details.`;
      } else {
        title = `Information Request Sent - #${lead.id}`;
        heading = `Message Sent to Customer`;
        bodyParagraph = `Hello ${lead.assignedPartnerName || 'Partner'},<br/><br/>Your message has been dispatched to the traveler: <br/><br/><div style="padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; font-style: italic;">"${note}"</div>`;
      }
      break;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">
              <!-- Header -->
              <tr>
                <td style="background-gradient: linear-gradient(135deg, #065f46 0%, #0d9488 100%); background-color: #0d9488; padding: 24px 32px; color: white;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🏔️ HillyTrip</h1>
                  <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; font-family: monospace; text-transform: uppercase; letter-spacing: 1px;">Verified Himalayan Local Network</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 32px; color: #1e293b; line-height: 1.6; font-size: 15px;">
                  <h2 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${heading}</h2>
                  <p style="margin-bottom: 16px;">${bodyParagraph}</p>
                  
                  ${detailsHtml}
                  
                  ${actionCall}
                  
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                  <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                    You are receiving this email because you are a registered user/partner on <b>HillyTrip</b>. Direct traveler-host connections keep commissions at 0% and support mountain communities.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f8fafc; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                  © 2026 HillyTrip. Proudly Supporting Sikkim & North Bengal Hosts.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const plainText = `
🏔️ HILLYTRIP - Verified Himalayan Local Network
--------------------------------------------------
${heading}

${bodyParagraph.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, "")}

Booking Details:
----------------
- Lead ID: #${lead.id}
- Service: ${lead.homestayName || lead.cabDriverId ? 'Private Sightseeing Vehicle' : 'Custom Trip Package'}
- Name: ${lead.customerName}
- Date: ${lead.checkInDate || 'N/A'} to ${lead.checkOutDate || 'N/A'}
- Guests: ${lead.numberOfGuests || 1} Guests
${lead.pickupLocation ? `- Pickup: ${lead.pickupLocation}\n` : ''}${lead.dropLocation ? `- Dropoff: ${lead.dropLocation}\n` : ''}${lead.specialRequest ? `- Special Request: "${lead.specialRequest}"\n` : ''}
${partnerContact ? `\nDirect Contact Details: ${partnerContact}` : ''}
${note ? `\nHost Note: "${note}"` : ''}

Visit HillyTrip to manage your account and bookings: ${process.env.APP_URL || 'http://localhost:3000'}
© 2026 HillyTrip. Supporting Sikkim & North Bengal Hosts.
  `;

  return { html, text: plainText, subject: `HillyTrip: ${title}` };
}
