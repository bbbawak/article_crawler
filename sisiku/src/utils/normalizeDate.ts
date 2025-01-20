export function normalizeDate(isoString: string): string {
  const date = new Date(isoString);

  // Ensure the input is a valid date
  if (isNaN(date.getTime())) {
    throw new Error("Invalid ISO date string provided");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
export default normalizeDate;
