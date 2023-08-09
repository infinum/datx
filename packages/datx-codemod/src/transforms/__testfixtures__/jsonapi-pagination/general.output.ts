// @ts-nocheck
/* eslint-disable */
async function getAllUsers() {
  const users = [];
  let response = await collection.fetchAll('user');

  users.push(...response.data);

  while (response.next) {
    response = await response.next?.();
    users.push(...response.data);
  }

  return users;
}

response = await this.subcommentsResponse.next?.();
