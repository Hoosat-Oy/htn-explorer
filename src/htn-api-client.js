const API_BASE = process.env.REACT_APP_API + "/";

export async function getBlock(hash) {
  const res = await fetch(`${API_BASE}blocks/${hash}`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getTransaction(hash) {
  const res = await fetch(`${API_BASE}transactions/${hash}`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getBlockdagInfo() {
  const res = await fetch(`${API_BASE}info/blockdag`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getCoinSupply() {
  const res = await fetch(`${API_BASE}info/coinsupply`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getAddressBalance(addr) {
  const res = await fetch(`${API_BASE}addresses/${addr}/balance`, {})
    .then((response) => response.json())
    .then((data) => {
      return data.balance;
    });
  return res;
}

export async function getAddressTxCount(addr) {
  const res = await fetch(`${API_BASE}addresses/${addr}/transactions-count`, {})
    .then((response) => response.json())
    .then((data) => {
      return data.total;
    });
  return res;
}

export async function getAddressUtxos(addr) {
  const res = await fetch(`${API_BASE}addresses/${addr}/utxos`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getHalving() {
  const res = await fetch(`${API_BASE}info/halving`, {})
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getTransactionsFromAddress(addr, limit = 20, offset = 0) {
  const res = await fetch(`${API_BASE}addresses/${addr}/full-transactions?limit=${limit}&offset=${offset}`, {
    headers: {
      "content-type": "application/json",
    },
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}

export async function getTransactions(tx_list, inputs, outputs) {
  const res = await fetch(`${API_BASE}transactions/search`, {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ transactionIds: tx_list }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return res;
}
