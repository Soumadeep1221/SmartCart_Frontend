export const getTokenBalance = (response) => response?.headers?.["x-token-balance"];

export const getAiErrorMessage = (error, fallback) => {
  if (error.response?.status === 402) return "You don’t have enough tokens";
  if (error.response?.status === 503) return "AI is unavailable right now, you were not charged";
  return fallback;
};
