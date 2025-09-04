const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getDocument = (document) => {
  if (document) {
    return baseUrl + "/static/document/" + document;
  }
};
