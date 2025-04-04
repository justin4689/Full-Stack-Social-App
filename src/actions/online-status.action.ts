export async function updateOnlineStatus(userId: string, isOnline: boolean) {
  try {
    const response = await fetch('/api/online-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isOnline }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating online status:", error);
    return { success: false, error: "Failed to update online status" };
  }
}

export async function getUserOnlineStatus(userId: string) {
  try {
    const response = await fetch(`/api/online-status?userId=${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting user online status:", error);
    return { success: false, error: "Failed to get user online status" };
  }
}
