# 🌙 AI-Powered Bedtime Stories

A magical bedtime stories app that uses **free Hugging Face AI** to generate unique, personalized stories for children.

## Features

- 🤖 **AI-Generated Stories**: Each story is uniquely created by Hugging Face AI models
- 💰 **Completely Free**: No API keys or costs required!
- 🎨 **Custom Characters & Settings**: Choose from various characters and magical settings
- 📖 **Beautiful Storybook Format**: Stories display in an interactive storybook with illustrations
- 🌟 **Educational Themes**: Stories incorporate valuable lessons about friendship, kindness, courage, and more
- 📱 **Mobile-Friendly**: Responsive design works great on all devices

## Deployment Setup

### Super Simple Deployment to Vercel

#### Option A: Deploy with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (no environment variables needed!)
vercel
```

#### Option B: Deploy with GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository
4. Deploy! (No environment variables needed)

### No Environment Variables Required!
This app uses free Hugging Face models, so no API keys or configuration needed.

## Local Development

```bash
# Install dependencies
npm install

# Start development server (no setup needed!)
vercel dev
```

## How It Works

1. **Story Generation**: User selects character, setting, and themes
2. **AI Processing**: Request sent to free Hugging Face AI models via serverless function
3. **Story Creation**: AI generates a 6-page story with the specified elements
4. **Display**: Story opens in beautiful storybook format with SVG illustrations

## AI Models Used

The app tries multiple free Hugging Face models for best results:
- Mixtral 8x7B Instruct
- Llama 2 7B Chat
- Zephyr 7B Beta
- DialoGPT Medium

## Fallback System

If all AI services are unavailable, the app automatically falls back to an intelligent template system to ensure stories are always generated.