const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getProfileImage = (image) => {
  if (image) {
    return baseUrl + "/static/profile-image/" + image;
  }
};
