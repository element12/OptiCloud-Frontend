import { useLoaderData, Link } from "react-router-dom";
import { formatPrice, customFetch, generateAmountOptions } from "../utils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../features/cart/cartSlice";

const singleProductQuery = (id) => {
  return {
    queryKey: ["singleProduct", id],
    queryFn: () => customFetch(`catalogo/api/v1/products/${id}`),
  };
};

export const loader =
  (queryClient) =>
  async ({ params }) => {
    const response = await queryClient.ensureQueryData(
      singleProductQuery(params.id)
    );
    return { product: response.data.data };
  };

const SingleProduct = () => {
  const { product } = useLoaderData();

  const {
    _id,
    nombre,
    descripcion,
    precio,
    stock,
    categoria
  } = product;

  // temporal image para pruebas
  const image = "https://www.hawkersco.com/on/demandware.static/-/Sites-Master-Catalog-Sunglasses/default/dwdb572c29/images/large/HONR21BBT0_L.jpg";

  const pesosCantidad = formatPrice(precio);

  const [amount, setAmount] = useState(1);

  const handleAmount = (e) => {
    setAmount(parseInt(e.target.value));
  };

  const cartProduct = {
    cartID: _id,
    productID: _id,
    image,
    title: nombre,
    price: precio,
    company: categoria,
    amount,
  };

  const dispatch = useDispatch();

  const addToCart = () => {
    dispatch(addItem({ product: cartProduct }));
  };

  return (
    <section>
      <div className="text-md breadcrumbs">
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/products">Productos</Link>
          </li>
        </ul>
      </div>

      {/* PRODUCT */}
      <div className="grid lg:grid-cols-2 mt-6 gap-y-8 lg:gap-x-16">

        {/* IMAGE */}
        <img
          src={image}
          alt={nombre}
          className="h-96 w-96 rounded-lg object-cover lg:w-full"
        />

        {/* PRODUCT INFO */}
        <div>
          <h1 className="capitalize text-3xl font-bold">{nombre}</h1>
          <h4 className="text-xl text-neutral-content font-bold mt-2">
            {categoria}
          </h4>

          <p className="text-xl mt-3">{pesosCantidad}</p>
          <p className="mt6 leading-8">{descripcion}</p>

          {/* AMOUNT */}
          <div className="form-control w-full max-w-xs">
            <label className="label my-3">
              <h4 className="text-md font-medium tracking-wider capitalize">
                Cantidad
              </h4>
            </label>
            <select
              className="select select-secondary select-bordered select-md"
              id="amount"
              value={amount}
              onChange={handleAmount}
            >
              {generateAmountOptions(stock)}
            </select>
          </div>

          {/* CART BUTTON */}
          <div className="mt-10">
            <button className="btn btn-secondary btn-md" onClick={addToCart}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SingleProduct;
