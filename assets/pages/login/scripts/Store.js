export function get(name) {
    try {
        return JSON.parse(localStorage.getItem(name));
    } catch {
        return null;
    }
}

export function set(name, data = {}) {
    localStorage.setItem(name, JSON.stringify(data));
}

export function remove(name) {
    localStorage.removeItem(name);
}