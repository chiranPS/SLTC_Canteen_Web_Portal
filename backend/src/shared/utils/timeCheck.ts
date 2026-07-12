export const isMealTimeValid = (categoryName: string, currentTime: Date = new Date()): boolean => {
  const currentHour = currentTime.getHours(); // 0 to 23
  const currentMinutes = currentTime.getMinutes();
  const timeInMinutes = currentHour * 60 + currentMinutes;

  const category = categoryName.trim().toLowerCase();

  // Define cut-off times in minutes from midnight
  // Breakfast: Ends at 10:00 AM (10 * 60 = 600)
  // Lunch: Ends at 3:00 PM (15 * 60 = 900)
  // Dinner: Ends at 8:00 PM (20 * 60 = 1200)
  
  if (category === 'breakfast' && timeInMinutes >= 600) {
    return false;
  }
  
  if (category === 'lunch' && timeInMinutes >= 900) {
    return false;
  }
  
  if (category === 'dinner' && timeInMinutes >= 1200) {
    return false;
  }

  // Other categories like "Tea / Beverages" might not have strict cut-offs
  return true;
};
