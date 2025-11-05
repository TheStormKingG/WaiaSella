<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BUk8TAav2jGfVKNjpi1--PhdAIvkLBWh

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.local.example` to `.env.local` (create the example file if it is missing) and set:
   - `GEMINI_API_KEY` for Gemini-powered flows
   - `VITE_NANO_BANANA_ENDPOINT` pointing to your Nano Banana enhancer endpoint
   - `VITE_NANO_BANANA_API_KEY` with the API key that authorizes Nano Banana requests
3. Run the app:
   `npm run dev`

### Nano Banana image enhancement

- Adding an inventory item now sends the name, category, and uploaded photo to Nano Banana to generate an HD photorealistic product image before saving.
- If the enhancer is not configured or returns an error, the app gracefully stores the original photo and surfaces a fallback message.
- Review `services/nanoBanana.ts` to fine-tune the request payload (prompt, endpoint) for your deployment.
