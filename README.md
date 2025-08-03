# 🌙 AI-Powered Bedtime Stories

A magical bedtime stories app that uses Claude AI to generate unique, personalized stories for children.

## Features

- 🤖 **AI-Generated Stories**: Each story is uniquely created by Claude AI
- 🎨 **Custom Characters & Settings**: Choose from various characters and magical settings
- 📖 **Beautiful Storybook Format**: Stories display in an interactive storybook with illustrations
- 🌟 **Educational Themes**: Stories incorporate valuable lessons about friendship, kindness, courage, and more
- 📱 **Mobile-Friendly**: Responsive design works great on all devices

## Deployment Setup

### 1. Get Claude API Key
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy the key for the next step

### 2. Deploy to Vercel

#### Option A: Deploy with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add your API key as environment variable
vercel env add ANTHROPIC_API_KEY
# Paste your Claude API key when prompted
```

#### Option B: Deploy with GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository
4. In Environment Variables, add:
   - `ANTHROPIC_API_KEY` = your Claude API key
5. Deploy!

### 3. Environment Variables
The app requires one environment variable:
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local file with your API key
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local

# Start development server
vercel dev
```

## How It Works

1. **Story Generation**: User selects character, setting, and themes
2. **AI Processing**: Request sent to Claude API via serverless function
3. **Story Creation**: Claude generates a 6-page story with the specified elements
4. **Display**: Story opens in beautiful storybook format with SVG illustrations

## API Usage

The app uses Claude 3 Haiku for fast, cost-effective story generation. Each story costs approximately $0.01-0.02 to generate.

## Fallback System

If the AI service is unavailable, the app automatically falls back to an intelligent template system to ensure stories are always generated.