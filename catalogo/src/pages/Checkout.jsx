import { useSelector } from "react-redux";
import { SectionTitle, CartTotals, CheckoutForm } from "../components";
import { toast } from "react-toastify";
import { redirect } from "react-router-dom";

export const loader = (store) => () => {
  const user = store.getState().userState.user;

  if (!user) {
    toast.warn("You must be logged in to checkout");
    return redirect("/login");
  }
  return null;
};

const CheckOut = () => {
  const cartTotal = useSelector((state) => state.cartState.cartTotal);

  if (cartTotal === 0) {
    return <SectionTitle text="Tu carrito está vacío" />;
  }

  return (
    <>
      <SectionTitle text="realiza tu pedido" />
      <div className="mt-8 grid gap-8 md:grid-cols-2 items-start">
        <CheckoutForm />
        <CartTotals />
      </div>
    </>
  );
};

export default CheckOut;
