const BASE_URL = "https://piano-check-api.onrender.com/api/practices";

export const getAll = async () => {
    const res = await fetch(BASE_URL);
    return res.json();
};

export const create = async (practice) => {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practice)
    });
    return res.json();
};

export const update = async (id, practice) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practice)
    });
    return res.json();
};

export const deleteOne = async (id) => {
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
};