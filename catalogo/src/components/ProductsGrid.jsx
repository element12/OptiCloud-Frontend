import { Link, useLoaderData } from "react-router-dom";
import { formatPrice } from "../utils";

const ProductsGrid = () => {
  const { products } = useLoaderData();

  return (
    <div className="pt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const { nombre, precio, imagen } = product;
        const pesosCantidad = formatPrice(precio);
        return (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="card w-full shadow-xl hover:shadow-2xl transition duration-300">
            <figure className="px-4 pt-4">
              <img
                //src={image}
                src="https://www.hawkersco.com/on/demandware.static/-/Sites-Master-Catalog-Sunglasses/default/dwdb572c29/images/large/HONR21BBT0_L.jpg"
                alt=""
                className="rounded-xl w-full object-cover h-64 md:h-48 "
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title tracking-wider capitalize">{nombre}</h2>
              <p className="text-secondary">{pesosCantidad}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductsGrid;
