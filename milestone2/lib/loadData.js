export default async function loadData() {
  let response = await fetch("/data/final_with_counties.json");
  let data = await response.json();

  return data;
}
