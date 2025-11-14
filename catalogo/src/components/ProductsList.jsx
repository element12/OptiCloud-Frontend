import { Link, useLoaderData } from "react-router-dom";
import { formatPrice } from "../utils";

const ProductsList = () => {
  const { products } = useLoaderData();

  return (
    <div className="mt-12 grid gap-y-8">
      {products.map((product) => {
        const { nombre, precio, imagen, descripcion } = product;
        const pesosCantidad = formatPrice(precio);
        return (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="p-8 rounded-lg flex flex-col sm:flex-row gap-y-4 flex-wrap bg-base-100 shadow-xl hover:shadow-2xl duration-300 group">
            <img
              src="https://www.hawkersco.com/on/demandware.static/-/Sites-Master-Catalog-Sunglasses/default/dwdb572c29/images/large/HONR21BBT0_L.jpg"
              alt={nombre}
              className="h-24 w-24 rounded-lg sm:w-32 sm:h-32 object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="ml-0 sm:ml-16">
              <h3 className="font-medium text-lg capitalize">{nombre}</h3>
              <h4 className="font-medium text-md capitalize text-neutral-content">
                {descripcion}
              </h4>
            </div>
            <p className="font-medium ml-0 sm:ml-auto text-lg">
              {pesosCantidad}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductsList;
