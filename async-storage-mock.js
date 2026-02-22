let storage = {};

module.exports = {
    async getItem(key) {
        return storage[key] ?? null;
    },
    async setItem(key, value) {
        storage[key] = value;
        return true;
    },
    async removeItem(key) {
        delete storage[key];
        return true;
    },
    // optional no‑op methods
    async mergeItem(key, value) {
        storage[key] = (storage[key] ?? "") + value;
        return true;
    },
    async clear() {
        storage = {};
        return true;
    },
};
