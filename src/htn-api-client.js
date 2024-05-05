const API_BASE = "https://api.network.hoosat.fi/"

export async function getBlock(hash) {
    const res = await fetch(`${API_BASE}blocks/${hash}`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}


export async function getTransaction(hash) {
    const res = await fetch(`${API_BASE}transactions/${hash}`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}

export async function getBlockdagInfo() {
    const res = await fetch(`${API_BASE}info/blockdag`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}

export async function getCoinSupply() {
    const res = await fetch(`${API_BASE}info/coinsupply`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}

export async function getAddressBalance(addr) {
    const res = await fetch(`${API_BASE}addresses/${addr}/balance`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data.balance
        })
    return res
}


export async function getAddressTxCount(addr) {
    const res = await fetch(`${API_BASE}addresses/${addr}/transactions-count`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data.total
        })
    return res
}



export async function getAddressUtxos(addr) {
    const res = await fetch(`${API_BASE}addresses/${addr}/utxos`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}



export async function getHalving() {
    const res = await fetch(`${API_BASE}info/halving`, { credentials: 'include' })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}

export async function getTransactionsFromAddress(addr, limit = 20, offset = 0) {
    const res = await fetch(`${API_BASE}addresses/${addr}/full-transactions?limit=${limit}&offset=${offset}`, {
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: "GET"
    })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}



export async function getTransactions(tx_list, inputs, outputs) {
    const res = await fetch(`${API_BASE}transactions/search`, {
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ "transactionIds": tx_list })
    })
        .then((response) => response.json())
        .then(data => {
            return data
        })
    return res
}

