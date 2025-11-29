# OpenAI API Setup Instructions

To enable AI-powered advice generation in AgroVisor, you need to set up an OpenAI API key.

## Steps to Enable OpenAI Advice

1. **Get an OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in to your OpenAI account
   - Create a new API key
   - Copy the API key (it starts with `sk-`)

2. **Create a `.env` file in the `backend` directory**
   - Create a file named `.env` in the `backend` folder
   - Add the following content:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```
   - Replace `sk-your-actual-api-key-here` with your actual API key

3. **Restart the Django server**
   - Stop the current server (Ctrl+C)
   - Start it again: `python manage.py runserver`
   - Check the console output - you should see: `✅ OpenAI API key found, model: gpt-4o-mini`

## Verification

After setting up the API key, when you:
- View crop recommendations in the dashboard
- Check the "Your Crop Analysis" section

You should see AI-generated advice instead of rule-based advice.

## Troubleshooting

- **If you see "⚠️ OPENAI_API_KEY not set"**: Make sure the `.env` file exists in the `backend` directory and contains the correct API key
- **If you see "⚠️ OpenAI library not available"**: Run `pip install openai` to install the OpenAI library
- **If advice generation fails**: Check the console for error messages. The system will automatically fall back to rule-based advice if OpenAI fails

## Cost Note

The system uses `gpt-4o-mini` by default, which is OpenAI's most cost-effective model. You can change the model in the `.env` file if needed.

