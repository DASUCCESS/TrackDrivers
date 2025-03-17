const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const createTrip = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-trip/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      throw new Error("Failed to create trip");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
