/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock fetch for Resend API
global.fetch = jest.fn();

const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    RESEND_API_KEY: 're_test_123',
    CONTACT_EMAIL_TO: 'test@example.com',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'email_123' }),
  });
});

// Import after setting up mocks
import { POST } from '../route';

describe('Contact API Route', () => {
  const createMockRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const validContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+357 99 123456',
    subject: 'Product inquiry',
    message: 'I would like to know more about your perfumes.',
  };

  describe('POST /api/contact', () => {
    it('should accept valid contact form submission', async () => {
      const request = createMockRequest(validContactData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject submission with missing name', async () => {
      const { name: _name, ...dataWithoutName } = validContactData;
      const request = createMockRequest(dataWithoutName);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject submission with invalid email', async () => {
      const request = createMockRequest({
        ...validContactData,
        email: 'invalid-email',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject submission with short name', async () => {
      const request = createMockRequest({
        ...validContactData,
        name: 'J',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject submission with short subject', async () => {
      const request = createMockRequest({
        ...validContactData,
        subject: 'Hi',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject submission with short message', async () => {
      const request = createMockRequest({
        ...validContactData,
        message: 'Hello',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject honeypot submissions (spam bots) via validation', async () => {
      const request = createMockRequest({
        ...validContactData,
        honeypot: 'spam content',
      });

      const response = await POST(request);
      const data = await response.json();

      // Honeypot field has max length 0 in schema, so filled honeypot fails validation
      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      // Verify fetch was not called (no email sent)
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should accept empty honeypot field', async () => {
      const request = createMockRequest({
        ...validContactData,
        honeypot: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept submission without phone (optional field)', async () => {
      const { phone: _phone, ...dataWithoutPhone } = validContactData;
      const request = createMockRequest(dataWithoutPhone);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle email service failure gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email service error' }),
      });

      const request = createMockRequest(validContactData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed');
    });
  });
});
