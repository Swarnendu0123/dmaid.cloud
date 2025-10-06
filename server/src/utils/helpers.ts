export const formatSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message,
  };
};

export const formatErrorResponse = (
  code: string,
  message: string,
  details?: any
) => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
};

export const parseJSON = (str: string): any => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON parsing error:", e);
    return null;
  }
};

export const sanitizePrompt = (prompt: string): string => {
  return prompt.trim().replace(/\s+/g, " ");
};

export const buildConversationContext = (
  conversationHistory: any[]
): string => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return "";
  }

  const context = conversationHistory
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      return `${role}: ${msg.content}`;
    })
    .join("\n\n");

  return `\n\nPrevious conversation:\n${context}\n\n`;
};
