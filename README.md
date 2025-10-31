# Wedding Planner App 🎊

> A serverless wedding information scraping and API service built with AWS Lambda

[한국어 문서](./README_KO.md)

## 🚀 Overview

This is a serverless application that scrapes wedding-related information (wedding halls, studios, dress shops) from the web and provides them through REST APIs using AWS Lambda and DynamoDB.

## ✨ Features

- **Automated Scraping**: Daily automated scraping of wedding venue information
- **RESTful APIs**: Easy-to-use APIs for accessing wedding data
- **Serverless Architecture**: Cost-effective and scalable solution with AWS Lambda
- **DynamoDB Storage**: Fast and reliable NoSQL database for wedding information

## 🏗️ Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Cloud Provider**: AWS (Lambda, DynamoDB, API Gateway)
- **Scraping**: Axios + Cheerio
- **Database**: DynamoDB

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Deploy to AWS
npm run deploy:dev

# For local development
npm run offline
```

## 📡 API Endpoints

- `GET /api/wedding-halls` - Get wedding hall listings
- `GET /api/studios` - Get studio listings
- `GET /api/dress` - Get dress shop listings

Query parameters:
- `limit`: Number of items to return (default: 50)

## 📁 Project Structure

```
src/
├── handlers/      # Lambda function handlers
├── scrapers/      # Web scraping logic
├── utils/         # Utility functions
└── config/        # Configuration files
```

## 📝 Documentation

For detailed documentation in Korean, see [README_KO.md](./README_KO.md)

## 🔧 Customization

You need to modify the scraper selectors in `src/scrapers/*.js` to match the actual website structure you want to scrape.

## 📄 License

MIT

---

👋 Author: [Resume](https://abounding-tile-0f9.notion.site/Resume-a9fec9d9cee34f39a67126abc3355f96?pvs=4)
