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

export async function updateReq(module, param, data) {
  const updateOptions = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const { id } = param;
  if (!id) {
    throw new Error("Id is missing in req!");
  }
  const res = await targetAPI(`${module}/${id}`, updateOptions);
  return res;
}

export async function getReq(module, param) {
  console.log(module, "module from service");
  const getOptions = {
    method: "GET",
  };
  if (!param) {
    const res = await targetAPI(`${module}`, getOptions);
    return res;
  }
  const {
    id,
    status,
    customerName,
    dueDate,
    issueDate,
    startDate,
    endDate,
    name,
    contactName,
    email,
    phone,
    city,
    country,
    industry,
    customerId,
    salesChannel,
    sort = "asc",
    page,
    perPage = 25,
  } = param;
  const res = await targetAPI(getOptions);
  return res;
  //  `${module}/${id}?status=paid
  // &{customerId}=${customerId}
  // &customerName:contains=${customerName}
  // &dueDate:gte=${dueDate}
  // &dueDate:lte=${dueDate}
  // &_sort=-${sort}
  // &_page=${page}
  // &_per_page=${perPage}`,
}

export async function delReq(module, param) {
  const delOptions = {
    method: "DELETE",
  };
  const { id } = param;
  if (!id) {
    throw new Error("Id is missing in req!");
  }
  const res = await targetAPI(`${module}/${id}`, delOptions);
  return res;
}
