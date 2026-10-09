import { NotificationEventType, NotificationChannel, NotificationTemplate } from '../../../types/communication';

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  // BOOKING_CREATED
  {
    id: 'tpl-booking-created-inapp',
    eventType: 'BOOKING_CREATED',
    channel: 'in_app',
    titleTemplate: 'Booking Request Received (#{{booking_id}})',
    bodyTemplate: 'Hello {{customer_name}}, your booking request for {{pickup}} to {{destination}} on {{journey_date}} has been logged.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-created-whatsapp',
    eventType: 'BOOKING_CREATED',
    channel: 'whatsapp',
    titleTemplate: 'HillyTrip Booking Received #{{booking_id}}',
    bodyTemplate: 'Namaste {{customer_name}}! 🚖 We received your booking request (#{{booking_id}}) from {{pickup}} to {{destination}} on {{journey_date}}. We are routing it to top mountain operators.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-created-email',
    eventType: 'BOOKING_CREATED',
    channel: 'email',
    titleTemplate: 'HillyTrip - Booking Request Received #{{booking_id}}',
    bodyTemplate: 'Dear {{customer_name}},\n\nYour trip booking request (#{{booking_id}}) has been successfully created.\n\nDetails:\n- Pickup: {{pickup}}\n- Destination: {{destination}}\n- Journey Date: {{journey_date}}\n- Vehicle: {{vehicle}}\n\nWe will update you as soon as an operator confirms your request.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-created-push',
    eventType: 'BOOKING_CREATED',
    channel: 'push',
    titleTemplate: 'Booking Created! #{{booking_id}}',
    bodyTemplate: 'Your trip from {{pickup}} to {{destination}} on {{journey_date}} is being processed.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-created-sms',
    eventType: 'BOOKING_CREATED',
    channel: 'sms',
    titleTemplate: 'HillyTrip Booking #{{booking_id}}',
    bodyTemplate: 'HillyTrip: Booking request #{{booking_id}} from {{pickup}} to {{destination}} created for {{journey_date}}.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // BOOKING_CONFIRMED
  {
    id: 'tpl-booking-confirmed-inapp',
    eventType: 'BOOKING_CONFIRMED',
    channel: 'in_app',
    titleTemplate: 'Booking Confirmed! (#{{booking_id}})',
    bodyTemplate: 'Great news {{customer_name}}! Your booking with {{operator_name}} from {{pickup}} to {{destination}} is confirmed.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-confirmed-whatsapp',
    eventType: 'BOOKING_CONFIRMED',
    channel: 'whatsapp',
    titleTemplate: 'Booking Confirmed 🎉 #{{booking_id}}',
    bodyTemplate: '🎉 Great news {{customer_name}}! Booking #{{booking_id}} is CONFIRMED by {{operator_name}}.\nVehicle: {{vehicle}}\nPickup: {{pickup}}\nJourney Date: {{journey_date}}.\nHave a wonderful trip in the Himalayas!',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-booking-confirmed-email',
    eventType: 'BOOKING_CONFIRMED',
    channel: 'email',
    titleTemplate: 'Confirmed: HillyTrip Booking #{{booking_id}}',
    bodyTemplate: 'Dear {{customer_name}},\n\nYour trip #{{booking_id}} is CONFIRMED!\n\nOperator: {{operator_name}}\nVehicle: {{vehicle}}\nPickup: {{pickup}}\nDestination: {{destination}}\nJourney Date: {{journey_date}}\nFare: ₹{{quote_price}}\n\nThank you for choosing HillyTrip!',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // DRIVER_ASSIGNED
  {
    id: 'tpl-driver-assigned-inapp',
    eventType: 'DRIVER_ASSIGNED',
    channel: 'in_app',
    titleTemplate: 'Driver Assigned: {{driver_name}}',
    bodyTemplate: 'Driver {{driver_name}} (Ph: {{driver_phone}}) has been assigned to your booking #{{booking_id}} with vehicle {{vehicle}}.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-driver-assigned-whatsapp',
    eventType: 'DRIVER_ASSIGNED',
    channel: 'whatsapp',
    titleTemplate: 'Driver Details for #{{booking_id}} 🚖',
    bodyTemplate: 'Hello {{customer_name}}, your driver for booking #{{booking_id}} is {{driver_name}} (Contact: {{driver_phone}}). Vehicle: {{vehicle}}.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // TRIP_STARTED
  {
    id: 'tpl-trip-started-inapp',
    eventType: 'TRIP_STARTED',
    channel: 'in_app',
    titleTemplate: 'Trip Started! 🌄',
    bodyTemplate: 'Your trip #{{booking_id}} from {{pickup}} to {{destination}} has officially started. Have a safe journey!',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // TRIP_COMPLETED
  {
    id: 'tpl-trip-completed-inapp',
    eventType: 'TRIP_COMPLETED',
    channel: 'in_app',
    titleTemplate: 'Trip Completed! 🏔️',
    bodyTemplate: 'Thank you for traveling with HillyTrip! Booking #{{booking_id}} is marked complete. Please share your review.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // QUOTE_SUBMITTED
  {
    id: 'tpl-quote-submitted-inapp',
    eventType: 'QUOTE_SUBMITTED',
    channel: 'in_app',
    titleTemplate: 'New Taxi Quote Received (₹{{quote_price}})',
    bodyTemplate: '{{operator_name}} submitted a quote of ₹{{quote_price}} for your custom route {{pickup}} ➔ {{destination}}.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // QUOTE_ACCEPTED
  {
    id: 'tpl-quote-accepted-inapp',
    eventType: 'QUOTE_ACCEPTED',
    channel: 'in_app',
    titleTemplate: 'Quote Accepted! (#{{booking_id}})',
    bodyTemplate: 'Customer {{customer_name}} accepted your quote of ₹{{quote_price}} for booking #{{booking_id}}.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // BOOKING_CANCELLED
  {
    id: 'tpl-booking-cancelled-inapp',
    eventType: 'BOOKING_CANCELLED',
    channel: 'in_app',
    titleTemplate: 'Booking Cancelled (#{{booking_id}})',
    bodyTemplate: 'Booking #{{booking_id}} from {{pickup}} to {{destination}} has been cancelled.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // OPERATOR_APPROVED
  {
    id: 'tpl-operator-approved-inapp',
    eventType: 'OPERATOR_APPROVED',
    channel: 'in_app',
    titleTemplate: 'Operator Account Approved! 🌟',
    bodyTemplate: 'Congratulations {{operator_name}}, your HillyTrip operator profile is approved and ready to accept bookings.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // CUSTOMER_REVIEW_REQUESTED
  {
    id: 'tpl-customer-review-inapp',
    eventType: 'CUSTOMER_REVIEW_REQUESTED',
    channel: 'in_app',
    titleTemplate: 'Rate Your Journey with {{operator_name}}',
    bodyTemplate: 'How was your drive from {{pickup}} to {{destination}}? Leave a quick review to help fellow hill travelers.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class TemplateEngine {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(customTemplates: NotificationTemplate[] = []) {
    const all = [...DEFAULT_TEMPLATES, ...customTemplates];
    all.forEach(t => {
      const key = `${t.eventType}_${t.channel}`;
      this.templates.set(key, t);
    });
  }

  public registerTemplate(template: NotificationTemplate) {
    const key = `${template.eventType}_${template.channel}`;
    this.templates.set(key, template);
  }

  public getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  public render(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    variables: Record<string, string | number | boolean | null | undefined>
  ): { title: string; body: string } {
    const key = `${eventType}_${channel}`;
    let template = this.templates.get(key);

    // Fallback to in_app template if channel template not found
    if (!template) {
      template = this.templates.get(`${eventType}_in_app`);
    }

    if (!template) {
      // Generic fallback
      const title = this.formatFallbackTitle(eventType, variables);
      const body = this.formatFallbackBody(eventType, variables);
      return { title, body };
    }

    const title = this.interpolate(template.titleTemplate, variables);
    const body = this.interpolate(template.bodyTemplate, variables);
    return { title, body };
  }

  public interpolate(templateStr: string, variables: Record<string, any>): string {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      const val = variables[key];
      if (val === undefined || val === null) {
        return `[${key}]`;
      }
      return String(val);
    });
  }

  private formatFallbackTitle(eventType: NotificationEventType, vars: Record<string, any>): string {
    const eventReadable = eventType.replace(/_/g, ' ').toLowerCase();
    const formatted = eventReadable.charAt(0).toUpperCase() + eventReadable.slice(1);
    const bookingId = vars.booking_id ? ` #${vars.booking_id}` : '';
    return `HillyTrip: ${formatted}${bookingId}`;
  }

  private formatFallbackBody(eventType: NotificationEventType, vars: Record<string, any>): string {
    const customer = vars.customer_name || 'Valued Traveler';
    const pickup = vars.pickup || 'origin';
    const dest = vars.destination || 'destination';
    return `Hello ${customer}, notification regarding your request (${pickup} ➔ ${dest}). Event: ${eventType}.`;
  }
}
