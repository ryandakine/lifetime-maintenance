# Send Email Edge Function

This Supabase Edge Function handles email sending via the Resend API.

## Setup Instructions

### 1. Deploy the Function

```bash
# Navigate to the supabase directory
cd supabase

# Deploy the function
supabase functions deploy send-email
```

### 2. Set Environment Variables

In your Supabase Dashboard:

1. Go to Settings > Edge Functions
2. Add the following environment variable:
   - `RESEND_API_KEY`: Your Resend API key (starts with `re_`)

### 3. Verify Domain

Make sure your domain is verified in Resend:
1. Go to your Resend Dashboard
2. Add and verify your domain (e.g., `lifetimefitness.com`)
3. Update the `from` email in the function to use your verified domain

### 4. Test the Function

You can test the function using the Supabase CLI:

```bash
supabase functions serve send-email --env-file .env.local
```

Then send a POST request to `http://localhost:54321/functions/v1/send-email`:

```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "text": "This is a test email from the maintenance app."
}
```

## Function Details

- **Method**: POST
- **Input**: JSON with `to`, `subject`, and `text` fields
- **Output**: JSON with success status and message ID
- **Authentication**: Uses Resend API key from environment variables

## Error Handling

The function includes comprehensive error handling for:
- Missing required fields
- Invalid API keys
- Resend API errors
- Network issues

## Security

- CORS headers are properly configured
- API keys are stored as environment variables
- Input validation is implemented 