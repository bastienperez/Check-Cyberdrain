# Webhook Formatting Guide

## Overview

The Check Extension supports multiple webhook formats to integrate with different platforms and services. You can configure webhooks to send formatted messages to Slack, Microsoft Teams, or as generic JSON payloads.

## Configuration

Configure webhook formatting in your managed policy or extension settings:

```json
{
  "genericWebhook": {
    "enabled": true,
    "url": "https://your-webhook-endpoint.com",
    "format": "slack", // "json", "slack", or "teams"
    "events": [
      "page_blocked",
      "detection_alert",
      "rogue_app_detected"
    ]
  }
}
```

## Supported Formats

### JSON Format (Default)

The standard JSON format sends structured data as documented in [webhooks.md](webhooks.md). This format is ideal for custom integrations and API endpoints.

**Example configuration:**
```json
{
  "genericWebhook": {
    "enabled": true,
    "url": "https://api.example.com/webhooks/security",
    "format": "json",
    "events": ["page_blocked", "detection_alert"]
  }
}
```

### Slack Format

Formats webhook payloads as Slack Block Kit messages with rich formatting, colors, and interactive elements.

**Features:**
- Color-coded attachments based on severity
- Structured fields for key information  
- Context information display
- Action buttons for relevant events
- Emoji indicators for different severities

**Example configuration:**
```json
{
  "genericWebhook": {
    "enabled": true,
    "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
    "format": "slack",
    "events": ["page_blocked", "detection_alert", "rogue_app_detected"]
  }
}
```

**Example Slack message structure:**
```json
{
  "attachments": [
    {
      "color": "#DC2626",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "🚨 CRITICAL: Malicious Page Blocked"
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*URL:*\n<https://phishing-site.com|phishing-site.com>"
            },
            {
              "type": "mrkdwn", 
              "text": "*Severity:* CRITICAL\n*Score:* 30/85"
            }
          ]
        }
      ]
    }
  ]
}
```

### Microsoft Teams Format

Formats webhook payloads as Microsoft Teams Adaptive Cards with structured information display.

**Features:**
- Color-coded theme based on severity
- Structured facts display
- Activity images for different event types
- Action buttons for investigation
- Rich text formatting

**Example configuration:**
```json
{
  "genericWebhook": {
    "enabled": true,
    "url": "https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK", 
    "format": "teams",
    "events": ["page_blocked", "detection_alert", "rogue_app_detected"]
  }
}
```

**Example Teams message structure:**
```json
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "contentUrl": null,
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.2",
        "body": [
          {
            "type": "TextBlock",
            "text": "🚨 CRITICAL: Malicious Page Blocked",
            "weight": "Bolder",
            "size": "Large",
            "color": "Attention"
          },
          {
            "type": "TextBlock", 
            "text": "Detected at 12/8/2025, 6:44:12 PM",
            "size": "Small",
            "color": "Default",
            "spacing": "None"
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "Severity",
                "value": "CRITICAL"
              },
              {
                "title": "Risk Score",
                "value": "30/85"
              }
            ],
            "spacing": "Medium"
          },
          {
            "type": "TextBlock",
            "text": "**URL:** https://phishing-site.com",
            "wrap": true,
            "spacing": "Medium"
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "View Details",
            "url": "https://phishing-site.com"
          }
        ]
      }
    }
  ]
}
```

## Severity Color Coding

All formatted messages use consistent color coding based on event severity:

| Severity | Color | Hex Code | Emoji |
|----------|-------|----------|-------|
| Critical | Red | #DC2626 | 🚨 |
| High | Orange | #EA580C | ⚠️ |
| Medium | Amber | #F59E0B | ⚡ |
| Low | Green | #10B981 | ℹ️ |
| Info | Blue | #3B82F6 | 💡 |

## Event Type Titles

Each webhook type gets a descriptive title in formatted messages:

| Webhook Type | Base Title |
|--------------|------------|
| detection_alert | Phishing Detection Alert |
| false_positive_report | False Positive Report |
| page_blocked | Malicious Page Blocked |
| rogue_app_detected | Rogue OAuth Application Detected |
| threat_detected | Security Threat Detected |
| validation_event | Domain Validation Event |

Critical and high-severity events get prefixed titles:
- Critical: "CRITICAL: {Base Title}"
- High: "HIGH RISK: {Base Title}"

## Field Mapping

Key information is consistently displayed across all formats:

### Core Fields
- **URL**: The blocked or detected URL
- **Severity**: Event severity level
- **Risk Score**: Detection score vs threshold (when available)
- **Detection Method**: How the threat was detected
- **Triggered Rule**: Which detection rule matched
- **Category**: Type of threat detected

### User Information (when available)
- **User**: User email address
- **Account Type**: Type of Microsoft account

### OAuth-Specific Fields (for rogue apps)
- **OAuth Client ID**: Application client identifier
- **Application Name**: Name of the detected app

### Context Information
- **Domain**: Extracted domain name
- **Page Title**: Title of the blocked page
- **Referrer**: Referring page URL

## Testing Webhook Formats

To test different webhook formats:

1. Configure a test webhook endpoint (you can use services like webhook.site for testing)
2. Set the desired format in your configuration
3. Trigger a detection event by visiting a test phishing page
4. Verify the formatted message structure

Example test configuration:
```json
{
  "genericWebhook": {
    "enabled": true,
    "url": "https://webhook.site/your-unique-url",
    "format": "slack",
    "events": ["page_blocked"]
  }
}
```

## Troubleshooting

### Common Issues

1. **Webhook not firing**: Verify the webhook is enabled and the URL is correct
2. **Format not applied**: Check that the format field is set to "slack" or "teams"
3. **Missing fields**: Some fields may not be available for all event types
4. **Teams webhook failing**: Ensure you're using a valid Teams webhook URL

### Debug Information

Enable debug logging to see webhook formatting details:
```json
{
  "enableDebugLogging": true
}
```

Check the browser console or extension logs for formatting and sending details.

## Integration Examples

### Slack Integration
1. Create a Slack App in your workspace
2. Enable Incoming Webhooks
3. Create a webhook URL for your desired channel
4. Configure the extension with format: "slack"

### Microsoft Teams Integration  
1. Go to your Teams channel
2. Click "..." → "Connectors" 
3. Configure "Incoming Webhook"
4. Copy the webhook URL
5. Configure the extension with format: "teams"

### Custom JSON Integration
Use format: "json" for custom integrations that need structured data for:
- Security Information and Event Management (SIEM) systems
- Custom alert processing
- Database logging
- API integrations