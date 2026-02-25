/**
 * Webhook formatters for different platforms (Slack, Microsoft Teams, etc.)
 */

export class WebhookFormatters {
  constructor() {
    this.severityColors = {
      critical: "#DC2626", // Red
      high: "#EA580C", // Orange
      medium: "#F59E0B", // Amber
      low: "#10B981", // Green
      info: "#3B82F6"  // Blue
    };

    this.severityEmojis = {
      critical: "🚨",
      high: "⚠️",
      medium: "⚡",
      low: "ℹ️",
      info: "💡"
    };
  }

  /**
   * Format payload for Slack
   */
  formatSlack(webhookType, payload) {
    const { data, user } = payload;
    const severity = data.severity || "medium";
    const color = this.severityColors[severity];
    const emoji = this.severityEmojis[severity];

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} ${this.getEventTitle(webhookType, severity)}`
        }
      },
      {
        type: "section",
        fields: this.buildSlackFields(data, user)
      }
    ];

    // Add context information if available
    if (data.context && Object.values(data.context).some(v => v !== null)) {
      blocks.push({
        type: "context",
        elements: this.buildSlackContext(data.context)
      });
    }

    // Add action buttons for certain event types
    if (webhookType === "page_blocked" || webhookType === "detection_alert") {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Details"
            },
            style: "primary",
            url: data.url
          }
        ]
      });
    }

    return {
      attachments: [
        {
          color: color,
          blocks: blocks,
          footer: `Check Extension v${payload.extensionVersion}`,
          ts: Math.floor(new Date(payload.timestamp).getTime() / 1000)
        }
      ]
    };
  }

  /**
   * Format payload for Microsoft Teams
   */
  formatTeams(webhookType, payload) {
    const { data, user } = payload;
    const severity = data.severity || "medium";
    const title = this.getEventTitle(webhookType, severity);

    const bodyElements = [];

    // Main title
    bodyElements.push({
      type: "TextBlock",
      text: "Security Alert",
      wrap: true,
      size: "Large",
      weight: "Bolder"
    });

    // Threat name and status badge
    bodyElements.push({
      type: "TextBlock",
      text: title,
      wrap: true,
      weight: "Bolder",
      targetWidth: "AtMost:Narrow"
    });

    // Status badge
    bodyElements.push({
      type: "Badge",
      text: this.getStatusText(severity),
      style: this.getBadgeStyle(severity),
      appearance: "Tint",
      icon: this.getBadgeIcon(severity),
      targetWidth: "AtMost:Narrow",
      spacing: "ExtraSmall",
      horizontalAlignment: "Left",
      size: "Large"
    });

    // Header with title and badge for larger screens
    bodyElements.push({
      type: "ColumnSet",
      columns: [
        {
          type: "Column",
          width: "stretch",
          items: [
            {
              type: "TextBlock",
              text: title,
              size: "Default",
              weight: "Bolder",
              maxLines: 4,
              wrap: true
            }
          ]
        },
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "Badge",
              text: this.getStatusText(severity),
              size: "Large",
              style: this.getBadgeStyle(severity),
              appearance: "Tint",
              icon: this.getBadgeIcon(severity),
              horizontalAlignment: "Right"
            }
          ]
        }
      ],
      targetWidth: "AtLeast:Standard"
    });

    // Key information section with icons
    bodyElements.push({
      type: "ColumnSet",
      spacing: "ExtraLarge",
      columns: [
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: "Threat Level",
              wrap: true,
              size: "Small",
              weight: "Bolder"
            },
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "Icon",
                      name: this.getThreatIcon(severity),
                      style: "Filled",
                      color: this.getTeamsColor(severity),
                      size: "xSmall"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: `${data.severity?.toUpperCase() || 'UNKNOWN'} (Score: ${data.score || 'N/A'}/${data.threshold || 'N/A'})`,
                      wrap: true,
                      spacing: "None",
                      size: "Small"
                    }
                  ],
                  spacing: "ExtraSmall"
                }
              ],
              spacing: "ExtraSmall"
            }
          ],
          verticalContentAlignment: "Center"
        },
        user && user.email ? {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: "Affected User",
              wrap: true,
              size: "Small",
              weight: "Bolder"
            },
            {
              type: "ColumnSet",
              spacing: "ExtraSmall",
              columns: [
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "Icon",
                      name: "Person",
                      style: "Filled",
                      color: "Default",
                      size: "xSmall"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: user.email,
                      wrap: true,
                      size: "Small"
                    }
                  ],
                  spacing: "Small"
                }
              ]
            }
          ],
          verticalContentAlignment: "Center",
          spacing: "ExtraLarge"
        } : null,
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: "Detection Time",
              wrap: true,
              size: "Small",
              weight: "Bolder"
            },
            {
              type: "ColumnSet",
              columns: [
                {
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "Icon",
                      name: "Clock",
                      style: "Filled",
                      color: "Default",
                      size: "xSmall"
                    }
                  ]
                },
                {
                  type: "Column",
                  width: "stretch",
                  items: [
                    {
                      type: "TextBlock",
                      text: new Date(payload.timestamp).toLocaleString(),
                      wrap: true,
                      size: "Small"
                    }
                  ],
                  spacing: "Small"
                }
              ],
              spacing: "ExtraSmall"
            }
          ],
          spacing: "ExtraLarge"
        }
      ].filter(col => col !== null),
      targetWidth: "AtLeast:Standard"
    });

    // Mobile/narrow version
    bodyElements.push({
      type: "Container",
      items: [
        {
          type: "TextBlock",
          text: "Threat Level",
          wrap: true,
          size: "Small",
          weight: "Bolder",
          color: "Default"
        },
        {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "auto",
              items: [
                {
                  type: "Icon",
                  name: this.getThreatIcon(severity),
                  size: "xSmall",
                  style: "Filled",
                  color: this.getTeamsColor(severity)
                }
              ]
            },
            {
              type: "Column",
              width: "stretch",
              spacing: "ExtraSmall",
              items: [
                {
                  type: "TextBlock",
                  text: `${data.severity?.toUpperCase() || 'UNKNOWN'} (Score: ${data.score || 'N/A'}/${data.threshold || 'N/A'})`,
                  wrap: true,
                  size: "Small",
                  color: "Default"
                }
              ]
            }
          ],
          spacing: "ExtraSmall"
        },
        user && user.email ? {
          type: "TextBlock",
          text: "Affected User",
          wrap: true,
          size: "Small",
          weight: "Bolder",
          color: "Default"
        } : null,
        user && user.email ? {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "auto",
              items: [
                {
                  type: "Icon",
                  name: "Person",
                  size: "xSmall",
                  style: "Filled",
                  color: "Default"
                }
              ]
            },
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "TextBlock",
                  text: user.email,
                  wrap: true,
                  size: "Small",
                  color: "Default"
                }
              ],
              spacing: "Small"
            }
          ],
          spacing: "ExtraSmall"
        } : null
      ].filter(item => item !== null),
      targetWidth: "AtMost:Narrow",
      spacing: "Medium"
    });

    // URL and technical details section
    bodyElements.push({
      type: "TextBlock",
      text: "Technical Details",
      wrap: true,
      spacing: "ExtraLarge",
      size: "Small",
      weight: "Bolder"
    });

    // URL, Detection Method, Rule in columns
    bodyElements.push({
      type: "ColumnSet",
      columns: [
        {
          type: "Column",
          width: "stretch",
          items: [
            {
              type: "TextBlock",
              text: "Blocked URL",
              wrap: true,
              size: "Small",
              color: "Default",
              isSubtle: true
            },
            {
              type: "TextBlock",
              text: data.url ? this.truncateUrl(data.url, 50) : "N/A",
              wrap: true,
              spacing: "ExtraSmall",
              size: "Small",
              weight: "Bolder",
              fontType: "Monospace"
            }
          ]
        },
        {
          type: "Column",
          width: "stretch",
          items: [
            {
              type: "TextBlock",
              text: "Detection Method",
              wrap: true,
              size: "Small",
              color: "Default",
              isSubtle: true
            },
            {
              type: "TextBlock",
              text: data.detectionMethod ? data.detectionMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Unknown",
              wrap: true,
              spacing: "ExtraSmall",
              size: "Small",
              weight: "Bolder"
            }
          ]
        }
      ],
      targetWidth: "AtLeast:Narrow"
    });

    // Alert reason
    if (data.reason) {
      bodyElements.push({
        type: "Container",
        items: [
          {
            type: "TextBlock",
            text: "Alert Description",
            wrap: true,
            size: "Small",
            weight: "Bolder",
            color: "Default",
            isSubtle: true
          },
          {
            type: "TextBlock",
            text: data.reason,
            wrap: true,
            spacing: "ExtraSmall",
            size: "Small"
          }
        ],
        spacing: "Medium"
      });
    }

    const adaptiveCard = {
      type: "AdaptiveCard",
      $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.5",
      body: bodyElements
    };

    // Actions
    if (webhookType === "page_blocked" || webhookType === "detection_alert") {
      adaptiveCard.actions = [
        {
          type: "Action.OpenUrl",
          title: "Investigate Threat",
          url: data.url
        }
      ];
    }

    return {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: adaptiveCard
        }
      ]
    };
  }

  /**
   * Get event title based on webhook type and severity
   */
  getEventTitle(webhookType, severity) {
    const titles = {
      detection_alert: "Phishing Detection Alert",
      false_positive_report: "False Positive Report",
      page_blocked: "Malicious Page Blocked",
      rogue_app_detected: "Rogue OAuth Application Detected",
      threat_detected: "Security Threat Detected",
      validation_event: "Domain Validation Event"
    };

    const baseTitle = titles[webhookType] || "Security Event";
    
    if (severity === "critical") {
      return `CRITICAL: ${baseTitle}`;
    } else if (severity === "high") {
      return `HIGH RISK: ${baseTitle}`;
    }
    
    return baseTitle;
  }

  /**
   * Build Slack fields array
   */
  buildSlackFields(data, user) {
    const fields = [];

    // URL field
    if (data.url) {
      fields.push({
        type: "mrkdwn",
        text: `*URL:*\n<${data.url}|${this.truncateUrl(data.url)}>`
      });
    }

    // Severity and Score
    if (data.severity) {
      let severityText = `*Severity:* ${data.severity.toUpperCase()}`;
      if (data.score !== undefined && data.threshold !== undefined) {
        severityText += `\n*Score:* ${data.score}/${data.threshold}`;
      }
      fields.push({
        type: "mrkdwn",
        text: severityText
      });
    }

    // Detection method and rule
    if (data.detectionMethod) {
      let detectionText = `*Detection:* ${data.detectionMethod}`;
      if (data.rule && typeof data.rule === 'object' && data.rule.id) {
        detectionText += `\n*Rule:* ${data.rule.id}`;
      } else if (data.rule) {
        detectionText += `\n*Rule:* ${data.rule}`;
      }
      fields.push({
        type: "mrkdwn",
        text: detectionText
      });
    }

    // User information
    if (user && user.email) {
      fields.push({
        type: "mrkdwn",
        text: `*User:* ${user.email}\n*Account:* ${user.accountType || 'unknown'}`
      });
    }

    // Special fields for rogue apps
    if (data.clientId) {
      fields.push({
        type: "mrkdwn",
        text: `*OAuth Client:* ${data.clientId}\n*App Name:* ${data.appName || 'Unknown'}`
      });
    }

    return fields;
  }

  /**
   * Build Slack context elements
   */
  buildSlackContext(context) {
    const elements = [];

    if (context.domain) {
      elements.push({
        type: "mrkdwn",
        text: `*Domain:* ${context.domain}`
      });
    }

    if (context.pageTitle) {
      elements.push({
        type: "mrkdwn",
        text: `*Page:* ${context.pageTitle}`
      });
    }

    if (context.referrer) {
      elements.push({
        type: "mrkdwn",
        text: `*Referrer:* ${context.referrer}`
      });
    }

    return elements;
  }

  /**
   * Build Microsoft Teams facts array (legacy - keeping for compatibility)
   */
  buildTeamsFacts(data, user) {
    return this.buildTeamsFactSet(data, user);
  }

  /**
   * Build Microsoft Teams FactSet for Adaptive Cards
   */
  buildTeamsFactSet(data, user) {
    const facts = [];

    if (data.severity) {
      facts.push({
        title: "Severity",
        value: data.severity.toUpperCase()
      });
    }

    if (data.score !== undefined && data.threshold !== undefined) {
      facts.push({
        title: "Risk Score",
        value: `${data.score}/${data.threshold}`
      });
    }

    if (data.detectionMethod) {
      facts.push({
        title: "Detection Method",
        value: data.detectionMethod
      });
    }

    if (data.rule) {
      const ruleName = typeof data.rule === 'object' && data.rule.id ? data.rule.id : data.rule;
      facts.push({
        title: "Triggered Rule",
        value: ruleName
      });
    }

    if (data.category) {
      facts.push({
        title: "Category",
        value: data.category
      });
    }

    if (user && user.email) {
      facts.push({
        title: "User",
        value: user.email
      });
      
      facts.push({
        title: "Account Type",
        value: user.accountType || 'unknown'
      });
    }

    // Special facts for rogue apps
    if (data.clientId) {
      facts.push({
        title: "OAuth Client ID",
        value: data.clientId
      });
      
      if (data.appName) {
        facts.push({
          title: "Application Name",
          value: data.appName
        });
      }
    }

    // Context information
    if (data.context) {
      if (data.context.domain) {
        facts.push({
          title: "Domain",
          value: data.context.domain
        });
      }

      if (data.context.pageTitle) {
        facts.push({
          title: "Page Title",
          value: data.context.pageTitle
        });
      }
    }

    return facts;
  }

  /**
   * Get activity image for Teams card based on webhook type
   */
  getActivityImage(webhookType) {
    // You can customize these URLs to point to your own icons
    const images = {
      detection_alert: "https://img.icons8.com/emoji/48/000000/warning.png",
      false_positive_report: "https://img.icons8.com/emoji/48/000000/information.png",
      page_blocked: "https://img.icons8.com/emoji/48/000000/stop-sign.png",
      rogue_app_detected: "https://img.icons8.com/emoji/48/000000/no-entry.png",
      threat_detected: "https://img.icons8.com/emoji/48/000000/exclamation-mark.png",
      validation_event: "https://img.icons8.com/emoji/48/000000/check-mark.png"
    };

    return images[webhookType] || images.detection_alert;
  }

  /**
   * Get Teams color name based on severity
   */
  getTeamsColor(severity) {
    const colorMap = {
      critical: "Attention",
      high: "Warning", 
      medium: "Accent",
      low: "Good",
      info: "Default"
    };
    return colorMap[severity?.toLowerCase()] || "Default";
  }

  /**
   * Get Teams container style based on severity
   */
  getTeamsContainerStyle(severity) {
    const styleMap = {
      critical: "attention",
      high: "warning",
      medium: "accent", 
      low: "good",
      info: "default"
    };
    return styleMap[severity?.toLowerCase()] || "default";
  }

  /**
   * Get status text for badges
   */
  getStatusText(severity) {
    const statusMap = {
      high: "High Risk",
      critical: "Critical Risk",
      medium: "Moderate Risk",
      low: "Low Risk",
      info: "Information"
    };
    return statusMap[severity] || "Unknown Risk";
  }

  /**
   * Get badge style based on severity
   */
  getBadgeStyle(severity) {
    const styleMap = {
      high: "Attention",
      critical: "Attention",
      medium: "Warning", 
      low: "Good",
      info: "Accent"
    };
    return styleMap[severity] || "Default";
  }

  /**
   * Get badge icon based on severity
   */
  getBadgeIcon(severity) {
    const iconMap = {
      high: "ErrorCircle",
      critical: "ErrorCircle",
      medium: "Warning",
      low: "CheckmarkCircle",
      info: "Info"
    };
    return iconMap[severity] || "Info";
  }

  /**
   * Get threat icon based on severity
   */
  getThreatIcon(severity) {
    const iconMap = {
      high: "Shield",
      critical: "Shield", 
      medium: "Warning",
      low: "CheckmarkCircle",
      info: "Info"
    };
    return iconMap[severity] || "Info";
  }

  /**
   * Truncate URL for display
   */
  truncateUrl(url, maxLength = 60) {
    if (!url || url.length <= maxLength) {
      return url;
    }
    
    try {
      const urlObj = new URL(url);
      const displayUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      
      if (displayUrl.length <= maxLength) {
        return displayUrl;
      }
      
      return displayUrl.substring(0, maxLength - 3) + "...";
    } catch (error) {
      return url.substring(0, maxLength - 3) + "...";
    }
  }
}