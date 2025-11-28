import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CartItemsList, CartTotals, SectionTitle } from "../components";

const Cart = () => {
  // temp
  const user = useSelector((state) => state.userState.user);

  const numItemsInCart = useSelector((state) => state.cartState.numItemsInCart);

  if (numItemsInCart === 0) {
    return <SectionTitle text="Tu carrito está vacío" />;
  }

  return (
    <>
      <SectionTitle text="Carrito de Compras" />
      <div className="mt-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <CartItemsList />
        </div>
        <div className="lg:col-span-4 lg:pl-4">
          <CartTotals />
          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-block mt-8">
              Proceder al Pago
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-block mt-8">
              Por favor inicie sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
