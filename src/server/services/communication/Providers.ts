import {
  NotificationProvider,
  NotificationChannel,
  ProviderDeliveryPayload,
  ProviderDeliveryResult
} from '../../../types/communication';

export class InAppProvider implements NotificationProvider {
  channel: NotificationChannel = 'in_app';
  providerName = 'HillyTrip InApp Engine';

  async send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    console.log(`[InAppProvider] Delivering in-app notification to user=${payload.recipientId}: "${payload.title}"`);
    return {
      success: true,
      providerName: this.providerName,
      messageId: `inapp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
  }
}

export class PushProvider implements NotificationProvider {
  channel: NotificationChannel = 'push';
  providerName = 'FCM / WebPush Gateway';

  async send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    console.log(`[PushProvider] Dispatching Push Payload to contact=${payload.recipientContact || payload.recipientId}`);
    console.log(` -> Title: ${payload.title}`);
    console.log(` -> Body: ${payload.body}`);

    // High simulation reliability
    return {
      success: true,
      providerName: this.providerName,
      messageId: `fcm_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawResponse: { multicast_id: Date.now(), success: 1, failure: 0 }
    };
  }
}

export class WhatsAppProvider implements NotificationProvider {
  channel: NotificationChannel = 'whatsapp';
  providerName = 'WhatsApp Business Cloud API';

  async send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    const recipient = payload.recipientContact || payload.recipientId;
    console.log(`[WhatsAppProvider] Sending WhatsApp message to: ${recipient}`);
    console.log(` -> Message:\n${payload.body}`);

    return {
      success: true,
      providerName: this.providerName,
      messageId: `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 6)}`,
      rawResponse: { messaging_product: 'whatsapp', contacts: [{ input: recipient, wa_id: recipient }] }
    };
  }
}

export class SMSProvider implements NotificationProvider {
  channel: NotificationChannel = 'sms';
  providerName = 'Twilio / DLT SMS Gateway';

  async send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    const recipient = payload.recipientContact || payload.recipientId;
    console.log(`[SMSProvider] Dispatching DLT SMS to: ${recipient}`);
    console.log(` -> Text: ${payload.body}`);

    return {
      success: true,
      providerName: this.providerName,
      messageId: `SM${Date.now()}${Math.random().toString(36).substring(2, 6)}`,
      rawResponse: { sid: `SM${Date.now()}`, status: 'queued' }
    };
  }
}

export class EmailProvider implements NotificationProvider {
  channel: NotificationChannel = 'email';
  providerName = 'SendGrid / Amazon SES Mailer';

  async send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    const recipient = payload.recipientContact || payload.recipientId;
    console.log(`[EmailProvider] Sending Email to: ${recipient}`);
    console.log(` -> Subject: ${payload.title}`);
    console.log(` -> Body Preview: ${payload.body.substring(0, 80)}...`);

    return {
      success: true,
      providerName: this.providerName,
      messageId: `email_id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawResponse: { statusCode: 202, message: 'Accepted for delivery' }
    };
  }
}

export class ChannelRouter {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();

  constructor() {
    this.registerProvider(new InAppProvider());
    this.registerProvider(new PushProvider());
    this.registerProvider(new WhatsAppProvider());
    this.registerProvider(new SMSProvider());
    this.registerProvider(new EmailProvider());
  }

  public registerProvider(provider: NotificationProvider) {
    this.providers.set(provider.channel, provider);
  }

  public getProvider(channel: NotificationChannel): NotificationProvider | undefined {
    return this.providers.get(channel);
  }

  public async dispatch(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult> {
    const provider = this.getProvider(payload.channel);
    if (!provider) {
      return {
        success: false,
        providerName: 'Unknown',
        error: `No provider registered for channel '${payload.channel}'`
      };
    }
    return await provider.send(payload);
  }
}
