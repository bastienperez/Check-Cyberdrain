# Formatted Webhook Configuration

## Quick Configuration Guide

### Accessing Settings

1. **Click on the Check extension icon** in your browser toolbar
2. **Select "Options"** from the context menu  
3. **Navigate to "General Settings"** in the left sidebar

### Configuring Webhook Notifications

In the **Webhook Notifications** section:

1. **Enable "Enable Webhook Notifications"**

2. **Enter your webhook URL**:
   - For **Slack**: `https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK`
   - For **Teams**: `https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK`
   - For **Custom API**: Your endpoint URL

3. **Choose the format**:
   - **JSON (Default)**: Raw structured data for custom integrations
   - **Slack Block Kit**: Rich formatted messages with colors and buttons for Slack  
   - **Microsoft Teams Adaptive Cards**: Interactive cards for Microsoft Teams

4. **Select event types** to send:
   - **Page Blocked**: When a malicious page is blocked
   - **Detection Alert**: Phishing detection alerts
   - **Rogue App Detected**: Malicious OAuth applications detected
   - **False Positive Report**: User false positive reports
   - **Threat Detected**: General threats detected
   - **Validation Event**: Legitimate domain validation events

5. **Click "Save Settings"**

## Webhook URL Examples

### Slack
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Microsoft Teams  
```
https://outlook.office.com/webhook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx@xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/IncomingWebhook/yyyyyyyyyyyyyyyy/zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz
```

## Creating Webhooks

### For Slack:
1. Go to your Slack workspace
2. Create a new app or use an existing one
3. Enable "Incoming Webhooks"
4. Create a new webhook for the desired channel
5. Copy the generated URL

### For Microsoft Teams:
1. Go to your Teams channel
2. Click on "..." → "Connectors" 
3. Configure "Incoming Webhook"
4. Give it a name and optionally upload an image
5. Copy the generated URL

## Configuration Testing

Use the built-in test page:
1. Open `chrome-extension://[EXTENSION-ID]/test-pages/webhook-testing.html`
2. Test different formats with your webhook URLs
3. Verify that messages appear correctly in your channels

## Formatted Messages

### Slack Format
- **Colors** based on severity (red for critical, orange for high, etc.)
- **Structured fields** with URL, severity, risk score
- **Action buttons** to view details
- **Emojis** to quickly identify alert type

### Teams Format
- **Adaptive cards** with colored theme based on severity
- **Structured facts** to display key information
- **Navigation actions** to related URLs
- **Timestamp** with detection date and time

### JSON Format
- **Complete structure** with all metadata
- **Ideal for integrations** with SIEM, APIs, databases
- **Compatible** with all systems accepting JSON

## Troubleshooting

### Webhook not triggering
- Verify that the webhook is enabled
- Check that the URL is correct
- Verify selected event types

### Incorrect format
- Ensure you've selected the correct format (Slack/Teams/JSON)
- Verify that the URL matches the platform type
- Test with the built-in test page

### Missing or incomplete messages
- Enable debug logging in settings
- Check the browser developer console
- Review activity logs in the extension

## Security and Privacy

- **No sensitive data** is transmitted in webhooks
- **User email** included only if publicly available
- **No passwords** or tokens in payloads
- **HTTPS required** for all webhook URLs

Webhooks are sent only during security events and contain the necessary information for monitoring and investigation.