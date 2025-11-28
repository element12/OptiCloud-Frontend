import { Filters, ProductsContainer, PaginationContainer } from "../components";
import { customFetch } from "../utils";

const url = "catalogo/api/v1/products";

const allProductsQuery = (queryParams) => {
  const { categoria, nombre, precioMin, precioMax, activo, page } = queryParams;

  return {
    queryKey: [
      "products",
      nombre ?? "",
      categoria ?? "general",
      precioMin ?? 0,
      precioMax ?? 10000000,
      activo ?? true,
      page ?? 1,
    ],
    queryFn: () =>
      customFetch(url, {
        params: queryParams,  // ✅ AQUÍ ESTABA EL ERROR
      }),
  };
};

export const loader =
  (queryClient) =>
  async ({ request }) => {

    const params = Object.fromEntries(
      new URL(request.url).searchParams.entries()
    );

    const response = await queryClient.ensureQueryData(
      allProductsQuery(params)
    );

    const products = response.data.data;

    const categorias = [
      "Todos",
      ...Array.from(new Set(products.map((p) => p.categoria))),
    ];

    const totalProductos = products.length;
    const meta = { categorias, totalProductos };

    return { products, meta, params };
  };

const Products = () => {
  return (
    <>
      <Filters />
      <ProductsContainer />
      {/* <PaginationContainer /> */}
    </>
  );
};

export default Products;
