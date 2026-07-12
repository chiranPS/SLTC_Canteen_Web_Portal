import { isMealTimeValid } from './src/shared/utils/timeCheck.js';

console.log("--- Testing time validity ---");

// Test 9:00 AM
const t9 = new Date();
t9.setHours(9, 0, 0, 0);
console.log("At 9:00 AM:");
console.log("Breakfast:", isMealTimeValid('Breakfast', t9)); // true
console.log("Lunch:", isMealTimeValid('Lunch', t9)); // true
console.log("Dinner:", isMealTimeValid('Dinner', t9)); // true

// Test 11:00 AM
const t11 = new Date();
t11.setHours(11, 0, 0, 0);
console.log("\nAt 11:00 AM:");
console.log("Breakfast:", isMealTimeValid('Breakfast', t11)); // false
console.log("Lunch:", isMealTimeValid('Lunch', t11)); // true
console.log("Dinner:", isMealTimeValid('Dinner', t11)); // true

// Test 16:00 (4:00 PM)
const t16 = new Date();
t16.setHours(16, 0, 0, 0);
console.log("\nAt 4:00 PM:");
console.log("Breakfast:", isMealTimeValid('Breakfast', t16)); // false
console.log("Lunch:", isMealTimeValid('Lunch', t16)); // false
console.log("Dinner:", isMealTimeValid('Dinner', t16)); // true

// Test 21:00 (9:00 PM)
const t21 = new Date();
t21.setHours(21, 0, 0, 0);
console.log("\nAt 9:00 PM:");
console.log("Breakfast:", isMealTimeValid('Breakfast', t21)); // false
console.log("Lunch:", isMealTimeValid('Lunch', t21)); // false
console.log("Dinner:", isMealTimeValid('Dinner', t21)); // false
