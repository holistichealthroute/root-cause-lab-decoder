import defaultLogo from "../assets/images/logo.png";

const str = (val: unknown, fallback = ""): string =>
  typeof val === "string" && val.trim() ? val.trim() : fallback;

export const config = {
  APP_NAME: str(process.env.REACT_APP_APP_NAME, "Root Cause Lab Detector"),
  API_URL: process.env.REACT_APP_API_URL,
} as const;
