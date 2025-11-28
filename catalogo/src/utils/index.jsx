import axios from "axios";

const developmentUrl = "https://apigateway-opticloud.azure-api.net";
//const developmentUrl = "/api";
export const customFetch = axios.create({
  baseURL: developmentUrl,
});

customFetch.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const formatPrice = (price) => {
  const pesosCantidad = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format((price));
  return pesosCantidad;
};

export const generateAmountOptions = (number) => {
  return Array.from({ length: number }, (_, index) => {
    const amount = index + 1;
    return (
      <option key={amount} value={amount}>
        {amount}
      </option>
    );
  });
};
