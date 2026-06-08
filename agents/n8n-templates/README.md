# XO N8N Templates

This repository contains a collection of powerful n8n workflow templates designed to automate various business processes. These templates leverage AI and automation to streamline operations across customer support, lead generation, and social media management.

## Overview

**n8n** is an open-source workflow automation tool that allows you to connect different services and automate tasks. This repository provides ready-to-use workflow templates that can be imported directly into your n8n instance to accelerate your automation journey.

The templates are organized into three main categories, each addressing specific business needs:

- **Customer Support**: Automate customer interactions, ticketing systems, and communication channels
- **Lead Generation**: Streamline lead discovery, qualification, and outreach processes
- **Social Media**: Automate content creation, publishing, and social media management

## Available Workflows

### Customer Support

The Customer Support category includes workflows that help manage and automate customer interactions across multiple channels.

| Workflow | Description |
|----------|-------------|
| **Customer Support with Slack & Linear** | Integrates Slack and Linear to create a seamless customer support ticketing system |
| **Multi Channel Customer Support** | Manages customer support across multiple communication channels |
| **The Recap AI - Gmail Agent** | AI-powered Gmail assistant for automated email management and responses |
| **Whatsapp Agent** | Automated WhatsApp customer support agent |
| **Zoom AI Meeting Assistant** | AI assistant that helps manage and summarize Zoom meetings |
| **Gmail Campaign Sender** | Automates email campaign sending through Gmail |

### Lead Generation

The Lead Generation category provides workflows to discover, qualify, and engage with potential customers.

| Workflow | Description |
|----------|-------------|
| **AI Local Business Lead Scraper** | Scrapes and identifies local business leads using AI |
| **LeadBot Autopilot: Chat-to-Lead for Salesforce Automation** | Converts chat interactions into qualified leads in Salesforce |
| **AI-Powered Funded Company Lead & Email Generator** | Identifies recently funded companies and generates targeted outreach emails |
| **Google Maps Business Scraper** | Extracts business information and contact details from Google Maps using Apify and Firecrawl |
| **1,000 LinkedIn Leads NO PAID API** | Generates LinkedIn leads without requiring paid API access |
| **AI Prospect Research & Call Prep Automation** | Automates prospect research and prepares call scripts for sales teams |
| **B2B AI Leads Automation** | Qualifies and reaches out to B2B leads automatically |

### Social Media

The Social Media category contains workflows for content creation, video generation, and social media publishing.

| Workflow | Description |
|----------|-------------|
| **The Recap AI - Nano Banana Static Ad Spinner** | Creates variations of static ads for testing and optimization |
| **Product-to-UGC Video Automation Pipeline** | Transforms product information into user-generated content style videos |
| **Rory Ridgers UGC Ads** | Generates UGC-style advertisements |
| **R25 \| The Ultimate Publishing Agent** | Comprehensive social media publishing automation |
| **Generate Instagram Content from Top Trends with AI Image Generation** | Creates Instagram content based on trending topics with AI-generated images |
| **The Recap AI - UGC Ads With Consistent Characters** | Generates UGC ads featuring consistent character designs |
| **Veo3 in n8n** | Integrates Google's Veo3 video generation model into n8n workflows |
| **The Recap AI - Repurpose YouTube Video To Socials** | Converts YouTube videos into content optimized for various social media platforms |
| **The Recap AI - eCommerce UGC Video Generator** | Creates UGC-style videos for eCommerce products using Sora2 |

## Getting Started

### Prerequisites

- An n8n instance (self-hosted or cloud)
- Required API keys and credentials for the services used in each workflow
- Basic understanding of n8n workflow concepts

### Installation

1. Clone this repository or download the specific workflow JSON file you need
2. Open your n8n instance
3. Navigate to **Workflows** → **Import from File** or **Import from URL**
4. Select the JSON file of the workflow you want to use
5. Configure the required credentials and API keys
6. Activate the workflow

### Configuration

Each workflow may require specific credentials and configuration:

- **API Keys**: OpenAI, Anthropic, Google, etc.
- **Service Credentials**: Slack, Linear, Salesforce, etc.
- **Webhook URLs**: Configure webhooks for triggering workflows
- **Database Connections**: If the workflow uses database storage

Refer to the individual workflow documentation within n8n for detailed setup instructions.

## Repository Structure

```
n8n-templates/
├── Customer Support/
│   ├── Customer_Support_Channel.json
│   ├── Multi_channel_customer_support.json
│   ├── The Recap AI - Gmail Agent.json
│   ├── Whatsapp_Agent.json
│   ├── Zoom_AI_Meeting_Assistant.json
│   └── gmail_campaign_sender.json
├── Lead Generation/
│   ├── AI_Local_Business_Lead_Scraper.json
│   ├── Chat_to_Lead.json
│   ├── Funded_Company_Lead_&_Email_Generator.json
│   ├── Google_maps_business_scraper.json
│   ├── LinkedIn_Leads_NO_PAID_API.json
│   ├── Prospect_Research_&_Call_Prep_Automation.json
│   └── Qualify_and_Reach_out_to_B2B_leads.json
├── Social Media/
│   ├── Nano Banana Static Ad Spinner.json
│   ├── Product-to-UGC Video Automation Pipeline.json
│   ├── Rory-Ridgers-UGC_ads.json
│   ├── The_Ultimate_Publishing_Agent.json
│   ├── Trending Instagram Content Generator.json
│   ├── UGC Ads With Consistent Characters.json
│   ├── Veo3 Auto-Video Factory.json
│   ├── content_repurposing_factory_linkedin_x.json
│   └── eCommerce UGC Video Generator Sora2.json
└── index.json
```

## Contributing

Contributions are welcome! If you have created a useful n8n workflow that you'd like to share:

1. Fork this repository
2. Add your workflow JSON file to the appropriate category folder
3. Update this README with your workflow description
4. Submit a pull request

## Support

For issues, questions, or suggestions related to these workflows, please open an issue in this repository.

## License

Please refer to individual workflow files for specific licensing information. These templates are provided as-is for educational and commercial use.

## Resources

- [n8n Official Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)

---

**Note**: These workflows may require various API keys and service subscriptions. Ensure you have the necessary access and understand the costs associated with each service before deploying these workflows in production.
