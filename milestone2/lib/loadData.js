export async function loadAllData() {
  const response = await fetch("/data/final_all.json");
  const data = await response.json();

  return data;
}
export async function loadDataLatLon() {
  const response = await fetch("/data/final_with_counties.json");
  const data = await response.json();

  return data;
}
