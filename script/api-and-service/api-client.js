const url = "http://localhost:3000";

export async function targetAPI(endpoint, option = {}) {
  const reqUrl = `${url}/${endpoint}`;
  const res = await fetch(reqUrl, option);

  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
