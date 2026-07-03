export interface OmiseTokenResponse {
  object: "token" | "error";
  id?: string;
  message?: string;
}

export interface OmiseStatic {
  setPublicKey: (key: string) => void;
  createToken: (
    type: "card",
    data: {
      name: string;
      number: string;
      expiration_month: number;
      expiration_year: number;
      security_code: string;
    },
    callback: (statusCode: number, response: OmiseTokenResponse) => void,
  ) => void;
}

declare global {
  interface Window {
    Omise?: OmiseStatic;
  }
}

export {};
