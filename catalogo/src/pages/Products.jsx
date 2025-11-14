import { Filters, ProductsContainer, PaginationContainer } from "../components";
import { customFetch } from "../utils";

const ulr = "/products";

const allProductsQuery = (queryParam) => {
  const { categoria, nombre, precioMin, precioMax, activo, page } = queryParam;

  return {
    queryKey: [
      "products",
      nombre ?? "",
      categoria ?? "all",
      precioMin ?? 0,
      precioMax ?? 100000,
      activo ?? true,
      page ?? 1,
    ],
    queryFn: () => customFetch(ulr, { queryParam }),
  };
};

export const loader =
  (queryClient) =>
  async ({ request }) => {
    // const params = new URL(request.ulr).searchParams
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);

    const response = await queryClient.ensureQueryData(
      allProductsQuery(params)
    );

    const products = response.data.data;

    const categorias = Array.from(
      new Set(products.map(p => p.categoria))
    );
    const totalProductos = products.length;
    const meta = { categorias, totalProductos };

    return { products, meta, params };
  };

const Products = () => {
  return (
    <>
      <Filters />
      <ProductsContainer />
     {/* // <PaginationContainer /> */}
    </>
  );
};

export default Products;
