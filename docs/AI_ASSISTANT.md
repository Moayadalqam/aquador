# AI Assistant Feature

## Overview

The Aquad'or AI Assistant is an intelligent chat widget that helps customers discover perfumes based on their preferences. It has comprehensive knowledge of all 354 perfumes and 44 essence oils in the catalogue.

## Features

- **Complete Catalogue Knowledge**: Knows every product by name, brand, number, gender, and notes
- **Smart Recommendations**: Suggests fragrances based on notes (jasmine, vanilla, oud, etc.)
- **Natural Conversations**: Engages in friendly, knowledgeable dialogues
- **Premium UI**: Luxury design with smooth animations and mobile responsive
- **Real-time Chat**: Instant responses with typing indicators

## Setup

### 1. API Key Configuration

Add one of these to your `.env.local`:

```bash
# Option A: OpenAI (Recommended for production)
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview

# Option B: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-3-5-sonnet-20241022
AI_API_ENDPOINT=https://api.anthropic.com/v1/messages
```

### 2. Rate Limiting (Optional but Recommended)

To prevent abuse, configure Upstash Redis:

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Architecture

### Components

1. **ChatWidget.tsx** (`src/components/ai/ChatWidget.tsx`)
   - Premium UI with animations
   - Message history management
   - Mobile responsive (fullscreen on mobile)
   - Quick suggestion buttons

2. **API Route** (`src/app/api/ai-assistant/route.ts`)
   - Processes chat messages
   - Searches catalogue for relevant products
   - Calls AI API (OpenAI/Anthropic)
   - Rate limiting protection

3. **Catalogue Data** (`src/lib/ai/catalogue-data.ts`)
   - Structured product database (398 products)
   - Search functionality by notes, name, brand
   - Product metadata with search terms

### How It Works

1. User types a message (e.g., "I love jasmine")
2. API route extracts fragrance notes from query
3. Searches catalogue for products with those notes
4. Provides relevant products as context to AI
5. AI generates personalized recommendation
6. Returns formatted response with product numbers

## Example Interactions

**User:** "I love jasmine"

**Assistant:** "Wonderful choice! Jasmine adds a beautiful, intoxicating floral elegance. Here are some exquisite options:

• **Jasmine (A01)** - Our pure jasmine essence oil, perfect for layering
• **Arabian Jasmine (A03)** - A rich, authentic Middle Eastern interpretation
• **Fleur Narcotique by Ex Nihilo (#43, Unisex)** - A luxurious perfume with narcotic jasmine notes

Would you like suggestions for a specific occasion or time of day?"

---

**User:** "Show me woody scents"

**Assistant:** "Excellent taste! Woody fragrances offer sophistication and warmth. Here are my top recommendations:

• **Oud Wood by Tom Ford (#142, Unisex)** - Classic, elegant oud with smoky notes
• **Santal 33 by Le Labo (#339, Unisex)** - Iconic sandalwood with a cult following
• **Cedrat Boise by Mancera (#131, Unisex)** - Citrus meets woody elegance

These work beautifully year-round. Interested in something more intense or subtle?"

## Customization

### System Prompt

The assistant's personality is defined in `/api/ai-assistant/route.ts`:

```typescript
const SYSTEM_PROMPT = `You are a knowledgeable and friendly fragrance consultant for Aquad'or...`
```

Modify this to adjust:
- Tone and personality
- Recommendation style
- Response length
- Expertise level

### Search Terms

Add more searchable terms to products in `catalogue-data.ts`:

```typescript
{
  number: '12',
  name: 'Vanilla Extasy',
  brand: 'Montale',
  gender: 'Women',
  type: 'perfume',
  searchTerms: ['vanilla', 'sweet', 'gourmand'] // Add more here
}
```

### UI Styling

Widget colors and styling in `ChatWidget.tsx`:
- Gold gradient: `from-gold to-gold-light`
- Dark background: `bg-dark`
- Border: `border-gold/20`

## Deployment

### Vercel Environment Variables

Set in Vercel Dashboard > Settings > Environment Variables:

```
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4-turbo-preview
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Build

```bash
npm run build
npm run deploy
```

### Monitoring

- Check API usage in OpenAI/Anthropic dashboard
- Monitor rate limits in Upstash
- Track errors in Sentry

## Performance

- **First Response**: ~2-3 seconds
- **Follow-up**: ~1-2 seconds
- **Rate Limit**: 10 requests per minute per IP (adjustable)
- **Cost**: ~$0.02 per conversation (GPT-4 Turbo)

## Future Enhancements

- [ ] Voice input support
- [ ] Multi-language (Greek, Russian)
- [ ] Image generation of product recommendations
- [ ] Integration with product pages
- [ ] Conversation history persistence
- [ ] Analytics dashboard
- [ ] A/B testing different prompts
- [ ] Sentiment analysis

## Troubleshooting

### "Failed to get response"

1. Check API key is valid
2. Verify model name is correct
3. Check API endpoint URL
4. Review rate limits

### Widget not appearing

1. Ensure `ChatWidget` is imported in layout
2. Check z-index conflicts
3. Verify JavaScript is enabled

### Slow responses

1. Use GPT-4 Turbo instead of GPT-4
2. Reduce max_tokens
3. Enable Redis caching
4. Consider edge functions

## Support

For issues or questions:
- Email: tech@aquadorcy.com
- GitHub: [Issues](https://github.com/qualiasolutions/aquador/issues)
