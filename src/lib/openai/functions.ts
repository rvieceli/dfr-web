const slots = [
  { date: "2023-09-12", slots: ["09:30", "10:30", "11:00", "15:30", "16:00"] },
  { date: "2023-09-13", slots: ["09:00", "10:00", "10:30", "11:00"] },
  { date: "2023-09-15", slots: ["09:00", "09:30", "10:00", "10:30", "11:00"] },
];

function getAvailableSlots(argsAsString: string) {
  let start_date = "2023-09-12";
  let end_date = "2023-09-15";

  try {
    const args = JSON.parse(argsAsString);

    if (args.start_date) {
      start_date = args.start_date;
    }

    if (args.end_date) {
      end_date = args.end_date;
    }
  } catch (error) {
    console.log(error);
  }
  console.log(start_date, end_date);

  const filtered = slots.filter(
    (slot) => slot.date >= start_date && slot.date <= end_date
  );
  console.log(filtered);
  return JSON.stringify(filtered);
}

function getSlotSuggestions() {
  const suggestions = [
    { date: "2023-09-12", slots: ["09:30", "15:30"] },
    { date: "2023-09-13", slots: ["09:00"] },
  ];
  return JSON.stringify(suggestions);
}

export const availableFunctions: Record<string, (...args: any) => any> = {
  getAvailableSlots,
  getSlotSuggestions,
};
