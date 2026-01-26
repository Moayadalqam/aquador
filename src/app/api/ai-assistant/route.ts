import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { catalogueProducts, searchCatalogue } from '@/lib/ai/catalogue-data';

// Note: Using OpenAI-compatible API (could be OpenAI, Anthropic via translation, etc.)
const API_KEY = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
const API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.AI_MODEL || 'gpt-4-turbo-preview';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a knowledgeable and friendly fragrance consultant for Aquad'or, a luxury perfume boutique in Cyprus. You have expert knowledge of our entire catalogue of ${catalogueProducts.length} fragrances (354 perfumes and 44 essence oils).

**Your Expertise:**
- You know every product in our catalogue by name, brand, and characteristics
- You can recommend fragrances based on notes (jasmine, rose, vanilla, oud, musk, etc.)
- You understand fragrance families: floral, woody, oriental, fresh, fruity, gourmand
- You can suggest perfumes by gender: Men, Women, or Unisex
- You know the difference between perfumes and essence oils

**Your Personality:**
- Warm, sophisticated, and helpful
- Use elegant language but stay approachable
- Provide 2-4 specific recommendations per request
- Include product numbers for easy reference
- Mention the brand and gender for each recommendation

**Guidelines:**
- When users mention a note (like jasmine, vanilla, oud), search the catalogue and recommend products
- Provide variety: mix luxury brands with accessible options
- For essence oils, explain they're concentrated fragrance oils
- If unsure, admit it gracefully and offer alternatives
- Keep responses concise but informative (2-3 paragraphs max)

**Example Responses:**
User: "I love jasmine"
You: "Wonderful choice! Jasmine adds a beautiful, intoxicating floral elegance. Here are some exquisite options:

• **Jasmine (A01)** - Our pure jasmine essence oil, perfect for layering
• **Arabian Jasmine (A03)** - A rich, authentic Middle Eastern interpretation
• **Fleur Narcotique by Ex Nihilo (#43, Unisex)** - A luxurious perfume with narcotic jasmine notes

Would you like suggestions for a specific occasion or time of day?"

Remember: You represent luxury, knowledge, and personalized service. Make every customer feel special.`;

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'ai-assistant');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (!API_KEY) {
      throw new Error('AI API key not configured');
    }

    const body = await request.json();
    const { messages, query } = body as { messages?: Message[]; query?: string };

    if (!messages && !query) {
      return NextResponse.json(
        { error: 'Messages or query required' },
        { status: 400 }
      );
    }

    // If just a query, convert to messages format
    const conversationMessages: Message[] = messages || [
      { role: 'user', content: query! }
    ];

    // Search catalogue for context if user mentions specific notes
    let catalogueContext = '';
    const userMessage = conversationMessages[conversationMessages.length - 1].content.toLowerCase();

    // Common fragrance notes to search for
    const noteKeywords = ['jasmine', 'rose', 'vanilla', 'oud', 'musk', 'leather', 'amber', 'sandalwood', 'tobacco', 'cherry', 'floral', 'fruity', 'woody'];
    const mentionedNotes = noteKeywords.filter(note => userMessage.includes(note));

    if (mentionedNotes.length > 0) {
      const relevantProducts = searchCatalogue(mentionedNotes[0]);
      if (relevantProducts.length > 0) {
        catalogueContext = `\n\n**Relevant Products for "${mentionedNotes[0]}":**\n` +
          relevantProducts.slice(0, 10).map(p =>
            `- ${p.name} (${p.number}) by ${p.brand} - ${p.gender}${p.type === 'essence-oil' ? ' [Essence Oil]' : ''}`
          ).join('\n');
      }
    }

    // Build full conversation with system prompt
    const fullMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT + catalogueContext },
      ...conversationMessages
    ];

    // Call AI API (OpenAI-compatible format)
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationId: data.id,
    });

  } catch (error) {
    Sentry.captureException(error);
    console.error('AI Assistant error:', error);

    const errorResponse = formatApiError(error, 'Failed to get AI response');
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
