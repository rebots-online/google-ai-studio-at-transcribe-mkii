import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { KnowledgeResult } from "./types";

// Attempt to get API key from environment variables
// In a browser environment, this needs to be handled by a build process (e.g., Vite, Webpack)
// or served via a secure backend proxy.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("Gemini API Key not found. Please set process.env.API_KEY.");
}

export const GeminiService = {
  fetchKnowledge: async (query: string): Promise<KnowledgeResult | null> => {
    if (!ai) {
      console.error("Gemini AI SDK not initialized. API Key missing.");
      // Fallback to a more informative error message for the user
      return {
        id: Date.now().toString(),
        query,
        summary: "Error: AI service is not configured. API key might be missing.",
        timestamp: new Date(),
      };
    }
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Corrected model
        contents: `Provide a concise summary and find a relevant web source for: "${query}". Focus on factual information.`,
        config: {
          tools: [{ googleSearch: {} }], // Enable Google Search grounding
          // Do NOT add responseMimeType: "application/json" when using googleSearch tool
        },
      });

      const text = response.text;
      let sourceInfo: KnowledgeResult['source'] | undefined = undefined;

      // Extract grounding information (website URLs)
      // response.candidates[0].groundingMetadata.groundingChunks -> list of objects like: {"web": {"uri": "...", "title": "..."}}
      const groundingChunks: GroundingChunk[] | undefined = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && groundingChunks.length > 0 && groundingChunks[0].web) {
         sourceInfo = {
            uri: groundingChunks[0].web.uri || '',
            title: groundingChunks[0].web.title || 'Source',
         };
      }
      
      return {
        id: Date.now().toString(),
        query,
        summary: text || "No information found.",
        source: sourceInfo,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error fetching knowledge from Gemini:", error);
      // Check for specific Gemini errors if possible, otherwise generic message
      let errorMessage = "Failed to retrieve knowledge. Please try again.";
      if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
      }
      return {
        id: Date.now().toString(),
        query,
        summary: errorMessage,
        timestamp: new Date(),
      };
    }
  },
};

export const MockAuthService = {
  loginWithEmail: async (email: string, _: string): Promise<{ success: boolean; user?: any; error?: string }> => {
    console.log(`Attempting email login for: ${email}`);
    return new Promise(resolve => setTimeout(() => {
      if (email === "test@example.com") {
        resolve({ success: true, user: { id: '1', email, name: "Test User" } });
      } else {
        resolve({ success: false, error: "Invalid credentials" });
      }
    }, 1000));
  },
  loginWithWallet: async (): Promise<{ success: boolean; user?: any; error?: string }> => {
    console.log("Attempting WalletConnect login...");
    // Simulate WalletConnect flow
    return new Promise(resolve => setTimeout(() => {
      // In a real app, this would involve WalletConnect SDK interactions
      resolve({ success: true, user: { id: 'wallet-user-123', walletAddress: '0x123...abc', name: "Wallet User" } });
    }, 1500));
  },
  logout: async (): Promise<void> => {
     console.log("Logging out...");
     return new Promise(resolve => setTimeout(resolve, 500));
  },
  registerWithEmail: async (email: string, _: string, name: string): Promise<{ success: boolean; user?: any; error?: string }> => {
    console.log(`Attempting email registration for: ${email}, Name: ${name}`);
    return new Promise(resolve => setTimeout(() => {
        resolve({ success: true, user: { id: 'new-user-1', email, name } });
    }, 1000));
  },
};

export const MockTranscriptionService = {
  startTranscription: async (): Promise<{ streamId: string }> => {
    console.log("Starting mock transcription session...");
    return new Promise(resolve => setTimeout(() => resolve({ streamId: 'mock-stream-123' }), 500));
  },
  stopTranscription: async (streamId: string): Promise<void> => {
    console.log(`Stopping mock transcription session: ${streamId}`);
    return new Promise(resolve => setTimeout(resolve, 500));
  },
  sendToCloudForProcessing: async (sessionId: string): Promise<{ success: boolean; message?: string }> => {
    console.log(`Sending session ${sessionId} to cloud for advanced STT...`);
    return new Promise(resolve => setTimeout(() => {
      resolve({ success: true, message: `Session ${sessionId} sent for advanced processing.` });
    }, 2000));
  }
};

// Placeholder for LemonSqueezy like service
export const MockPaymentService = {
  initiateSubscription: async (planId: string): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> => {
    console.log(`Initiating subscription for plan: ${planId}`);
    // Simulate API call to payment provider
    return new Promise(resolve => setTimeout(() => {
      if (planId === "pro_plan") {
        resolve({ success: true, checkoutUrl: "https://lemonsqueezy.com/checkout/mock-pro" });
      } else {
        resolve({ success: false, error: "Invalid plan ID" });
      }
    }, 1000));
  },
  manageSubscription: async (): Promise<{ success: boolean; managementUrl?: string; error?: string }> => {
    console.log("Fetching subscription management URL...");
    return new Promise(resolve => setTimeout(() => {
      resolve({ success: true, managementUrl: "https://lemonsqueezy.com/billing/mock-user" });
    }, 1000));
  }
};