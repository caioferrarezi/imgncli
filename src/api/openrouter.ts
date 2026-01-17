interface ImageObject {
  type: "image_url";
  image_url: {
    url: string;
  };
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
      images?: ImageObject[];
    };
  }>;
}

interface GenerateImageResult {
  success: true;
  imageBase64: string;
  textContent: string;
}

interface GenerateImageError {
  success: false;
  error: string;
}

export type GenerateImageResponse = GenerateImageResult | GenerateImageError;

export async function generateImage(
  prompt: string,
  apiKey: string,
  model: string,
): Promise<GenerateImageResponse> {
  if (!apiKey) {
    return {
      success: false,
      error:
        "API key is not configured. Use /setup to add your OpenRouter API key.",
    };
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://github.com/aiascii",
          "X-Title": "AI ASCII Image Generator",
        },
        body: JSON.stringify({
          model,
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: `Generate an image of: ${prompt}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `API request failed (${response.status}): ${errorText}`,
      };
    }

    const data = (await response.json()) as OpenRouterResponse;
    const message = data.choices?.[0]?.message;

    if (!message?.images || message.images.length === 0) {
      return {
        success: false,
        error:
          "No image was generated. The model may not have understood the prompt.",
      };
    }

    // Extract base64 data from data URL (format: "data:image/png;base64,...")
    const imageObject = message.images[0]!;
    const imageDataUrl = imageObject.image_url.url;
    const base64Match = imageDataUrl.match(/^data:image\/\w+;base64,(.+)$/);

    if (!base64Match) {
      return {
        success: false,
        error: "Invalid image format returned from API",
      };
    }

    return {
      success: true,
      imageBase64: base64Match[1]!,
      textContent: message.content || "",
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
