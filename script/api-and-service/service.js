import { targetAPI } from "./api-client.js";

export async function createReq(module, data) {
  const createOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const res = await targetAPI(`${module}`, createOptions);
  return res;
}

export async function updateReq(module, data, id) {
  // console.log(id, ": in service");
  const updateOptions = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  // const { id } = param;
  if (!id) {
    throw new Error("Id is missing in req!");
  }
  const res = await targetAPI(`${module}/${id}`, updateOptions);
  return res;
}

export async function getReq(module, param) {
  // console.log(module, "module from service");
  // console.log(param, "param in service");
  const getOptions = {
    method: "GET",
  };
  if (!param) {
    const res = await targetAPI(`${module}`, getOptions);
    return res;
  }
  const searchParams = {
    sort: "asc",
    perPage: 25,
    ...param,
  };
  const cleanEntries = Object.entries(searchParams).filter(([_, value]) => {
    return value !== undefined && value !== null && value !== "";
  });
  const queryString = new URLSearchParams(cleanEntries).toString();
  const res = await targetAPI(`${module}?${queryString}`, getOptions);
  return res;
}

export async function delReq(module, id) {
  const delOptions = {
    method: "DELETE",
  };
  // const { id } = param;
  if (!id) {
    throw new Error("Id is missing in req!");
  }
  const res = await targetAPI(`${module}/${id}`, delOptions);
  return res;
}
