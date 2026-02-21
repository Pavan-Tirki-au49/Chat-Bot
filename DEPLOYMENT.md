# Simple Deployment via Netlify

Since your project is a **Vite/React** app, the best way to deploy it for free is **Netlify**.

### 🚀 Follow these 3 steps:

1. **Go to Netlify**: [https://app.netlify.com/](https://app.netlify.com/)
2. **Connect GitHub**:
   - Click "Add new site" -> "Import an existing project".
   - Select **GitHub** and pick your `Chat-Bot` repository.
3. **Configure Environment Variables**:
   - This part is **CRITICAL** for the AI to work.
   - Netlify will ask for "Build settings". Leave them as default (`npm run build`, `dist`).
   - Click **"Add environment variables"**.
   - Input:
     - Key: `VITE_HUGGINGFACE_API_KEY`
     - Value: `(Paste your hf_... token here)`
4. **Deploy!**
   - Click **"Deploy site"**. Netlify will give you a live URL in about 1 minute.

### 💡 Why Environment Variables?
Your `.env` file is ignored by Git (for security). You must manually add your Hugging Face key in the Netlify dashboard so the live website knows how to talk to the AI!
