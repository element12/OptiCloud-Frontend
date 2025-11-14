import axios from "axios";

const productionUrl = "https://strapi-store-server.onrender.com/api";
const developmentUrl = "http://localhost:3002/api/v1";
export const customFetch = axios.create({
  baseURL: developmentUrl,
});

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
