const generateBlake3LikeHash = () => {
  const chars = 'abcdef0123456789'; // Hexadecimal characters
  let hash = '';
  for (let i = 0; i < 64; i++) { // Blake3 hashes are typically 64 characters long
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generated Blake3-like hashes for blueparents references
const hash1 = generateBlake3LikeHash();
const hash2 = generateBlake3LikeHash();
const hash3 = generateBlake3LikeHash();
const hash4 = generateBlake3LikeHash();
const hash5 = generateBlake3LikeHash();
const hash6 = generateBlake3LikeHash();
const hash7 = generateBlake3LikeHash();
const hash8 = generateBlake3LikeHash();
const hash9 = generateBlake3LikeHash();
const hash10 = generateBlake3LikeHash();
const hash11 = generateBlake3LikeHash();
const hash12 = generateBlake3LikeHash();
const hash13 = generateBlake3LikeHash();
const hash14 = generateBlake3LikeHash();
const hash15 = generateBlake3LikeHash();
const hash16 = generateBlake3LikeHash();
const hash17 = generateBlake3LikeHash();
const hash18 = generateBlake3LikeHash();
const hash19 = generateBlake3LikeHash();
const hash20 = generateBlake3LikeHash();
const hash21 = generateBlake3LikeHash();
const hash22 = generateBlake3LikeHash();
const hash23 = generateBlake3LikeHash();
const hash24 = generateBlake3LikeHash();
const hash25 = generateBlake3LikeHash();
const hash26 = generateBlake3LikeHash();
const hash27 = generateBlake3LikeHash();
const hash28 = generateBlake3LikeHash();
const hash29 = generateBlake3LikeHash();
const hash30 = generateBlake3LikeHash();
const hash31 = generateBlake3LikeHash();
const hash32 = generateBlake3LikeHash();
const hash33 = generateBlake3LikeHash();
const hash34 = generateBlake3LikeHash();
const hash35 = generateBlake3LikeHash();
const hash36 = generateBlake3LikeHash();
const hash37 = generateBlake3LikeHash();
const hash38 = generateBlake3LikeHash();
const hash39 = generateBlake3LikeHash();
const hash40 = generateBlake3LikeHash();
const hash41 = generateBlake3LikeHash();
const hash42 = generateBlake3LikeHash();
const hash43 = generateBlake3LikeHash();
const hash44 = generateBlake3LikeHash();
const hash45 = generateBlake3LikeHash();
const hash46 = generateBlake3LikeHash();
const hash47 = generateBlake3LikeHash();
const hash48 = generateBlake3LikeHash();
const hash49 = generateBlake3LikeHash();
const hash50 = generateBlake3LikeHash();
const hash51 = generateBlake3LikeHash();
const hash52 = generateBlake3LikeHash();
const hash53 = generateBlake3LikeHash();
const hash54 = generateBlake3LikeHash();
const hash55 = generateBlake3LikeHash();
const hash56 = generateBlake3LikeHash();
const hash57 = generateBlake3LikeHash();
const hash58 = generateBlake3LikeHash();
const hash59 = generateBlake3LikeHash();
const hash60 = generateBlake3LikeHash();

// Mock data with "Blake3-like" hashes for block IDs
export const mockData = [
  { id: hash1, isChain: true, blueparents: [] },
  { id: hash2, isChain: true, blueparents: [hash1] },
  { id: hash3, isChain: true, blueparents: [hash1] },
  { id: hash4, isChain: true, blueparents: [hash2, hash3] },
  { id: hash5, isChain: true, blueparents: [hash2] },
  { id: hash6, isChain: true, blueparents: [hash3] },
  { id: hash7, isChain: true, blueparents: [hash4, hash5] },
  { id: hash8, isChain: true, blueparents: [hash5, hash6] },
  { id: hash9, isChain: true, blueparents: [hash7, hash8] },
  { id: hash10, isChain: true, blueparents: [hash8, hash9] },
  { id: hash11, isChain: true, blueparents: [hash7] },
  { id: hash12, isChain: true, blueparents: [hash10, hash11] },
  { id: hash13, isChain: true, blueparents: [hash11] },
  { id: hash14, isChain: true, blueparents: [hash12, hash13] },
  { id: hash15, isChain: true, blueparents: [hash12] },
  { id: hash16, isChain: true, blueparents: [hash14, hash15] },
  { id: hash17, isChain: true, blueparents: [hash13, hash16] },
  { id: hash18, isChain: true, blueparents: [hash17, hash15] },
  { id: hash19, isChain: true, blueparents: [hash16, hash18] },
  { id: hash20, isChain: true, blueparents: [hash18] },
  { id: hash21, isChain: true, blueparents: [hash20, hash17] },
  { id: hash22, isChain: true, blueparents: [hash19, hash21] },
  { id: hash23, isChain: true, blueparents: [hash22] },
  { id: hash24, isChain: true, blueparents: [hash22, hash23] },
  { id: hash25, isChain: true, blueparents: [hash24, hash21] },
  { id: hash26, isChain: true, blueparents: [hash23, hash25] },
  { id: hash27, isChain: true, blueparents: [hash26] },
  { id: hash28, isChain: true, blueparents: [hash25, hash27] },
  { id: hash29, isChain: true, blueparents: [hash28] },
  { id: hash30, isChain: true, blueparents: [hash28, hash29] },
  { id: hash31, isChain: true, blueparents: [hash30] },
  { id: hash32, isChain: true, blueparents: [hash29, hash31] },
  { id: hash33, isChain: true, blueparents: [hash31, hash32] },
  { id: hash34, isChain: true, blueparents: [hash30, hash33] },
  { id: hash35, isChain: true, blueparents: [hash34, hash33] },
  { id: hash36, isChain: true, blueparents: [hash34, hash35] },
  { id: hash37, isChain: true, blueparents: [hash35, hash36] },
  { id: hash38, isChain: true, blueparents: [hash37, hash32] },
  { id: hash39, isChain: true, blueparents: [hash38, hash36] },
  { id: hash40, isChain: true, blueparents: [hash37, hash39] },
  { id: hash41, isChain: true, blueparents: [hash40] },
  { id: hash42, isChain: true, blueparents: [hash40, hash41] },
  { id: hash43, isChain: true, blueparents: [hash41, hash42] },
  { id: hash44, isChain: true, blueparents: [hash42] },
  { id: hash45, isChain: true, blueparents: [hash43, hash44] },
  { id: hash46, isChain: true, blueparents: [hash45, hash44] },
  { id: hash47, isChain: true, blueparents: [hash46, hash45] },
  { id: hash48, isChain: true, blueparents: [hash47, hash46] },
  { id: hash49, isChain: true, blueparents: [hash48, hash44] },
  { id: hash50, isChain: true, blueparents: [hash49, hash47] },
  { id: hash51, isChain: true, blueparents: [hash50] },
  { id: hash52, isChain: true, blueparents: [hash51, hash50] },
  { id: hash53, isChain: true, blueparents: [hash52, hash48] },
  { id: hash54, isChain: true, blueparents: [hash53, hash49] },
  { id: hash55, isChain: true, blueparents: [hash54] },
  { id: hash56, isChain: true, blueparents: [hash54, hash55] },
  { id: hash57, isChain: true, blueparents: [hash56, hash53] },
  { id: hash58, isChain: true, blueparents: [hash57, hash56] },
  { id: hash59, isChain: true, blueparents: [hash58] },
  { id: hash60, isChain: true, blueparents: [hash59] },
];