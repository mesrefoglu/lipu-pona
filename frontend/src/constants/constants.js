const isLocal = process.env.NODE_ENV === "development";

export const BASE_URL = isLocal ? "http://localhost:3000" : "https://lipupona.net";

export const API_URL = isLocal ? "http://127.0.0.1:8000/api" : "https://lipupona.fly.dev/api";

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const COLOR_1 = "#222831";
export const COLOR_2 = "#393E46";
export const COLOR_3 = "#00ADB5";
export const COLOR_4 = "#EEEEEE";
