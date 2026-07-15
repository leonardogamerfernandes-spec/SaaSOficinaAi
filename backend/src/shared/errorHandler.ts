/**
 * Sanitizes error messages for API responses.
 * In production, internal error details are hidden from the client.
 */
export function sanitizeError(error: any): string {
  if (process.env.NODE_ENV === "production") {
    // Log the real error server-side for debugging
    console.error("[OficinaAI Internal Error]", error);
    return "Erro interno do servidor. Tente novamente mais tarde.";
  }
  // In development, show the real error for easier debugging
  return error?.message || "Unknown error";
}
