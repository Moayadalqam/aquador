import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { catalogueProducts, searchCatalogue } from '@/lib/ai/catalogue-data';

// OpenRouter API (supports OpenAI, Anthropic, Google, and many other models)
const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.AI_MODEL || 'google/gemini-2.0-flash-001';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a concise fragrance consultant for Aquad'or Cyprus. You know our ${catalogueProducts.length} products.

**Response Rules:**
- Keep answers SHORT (2-4 sentences max + bullet list)
- Give 2-3 product recommendations maximum
- Format: [Product Name](link) by Brand (#number)
- No lengthy explanations - be direct and helpful

**Link Format (IMPORTANT):**
- For Women's perfumes: [Name](/shop/women)
- For Men's perfumes: [Name](/shop/men)
- For Unisex perfumes: [Name](/shop/niche)
- For Essence Oils: [Name](/shop/essence-oil)
- Contact page: [contact us](/contact)
- Create custom perfume: [create your own](/create-perfume)

**Example Response:**
User: "I love jasmine"
You: Great choice! Here are jasmine fragrances:

• [Fleur Narcotique](/shop/niche) by Ex Nihilo (#43) - intoxicating floral
• [Jasmine Essence](/shop/essence-oil) (A01) - pure oil for layering

Want day or evening scents?

**Key Points:**
- Be warm but brief
- Always include clickable links
- Ask one follow-up question max`;

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'ai-assistant');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (!API_KEY) {
      console.error('Missing API key. OPENROUTER_API_KEY:', !!process.env.OPENROUTER_API_KEY);
      throw new Error('AI API key not configured');
    }

    console.log('AI Assistant: Using model:', MODEL);

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

    // Call AI API (OpenRouter-compatible format)
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aquadorcy.com',
        'X-Title': "Aquad'or Fragrance Assistant",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`AI API error (${response.status}): ${errorText}`);
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
