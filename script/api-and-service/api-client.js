const url = "http://localhost:3000";
export async function targetAPI(endpoint, option = {}) {
  console.log(endpoint, "endpoint in api-client");
  try {
    let reqUrl = `${url}/${endpoint}`;
    const res = await fetch(reqUrl, option);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    if (res.status === 204) {
      return null;
    }
    const data = await res.json();

    return data;
  } catch (error) {
    throw error;
  }
}
