export default async function loadData() {
  let response = await fetch("/data/final_only_lat_lon.json");

  let data = await response.json();

  console.log(data[0]);
}
