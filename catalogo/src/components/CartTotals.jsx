import { useSelector } from "react-redux";
import { formatPrice } from "../utils";

const CartTotals = () => {
  const { cartTotal, shipping, tax, orderTotal } = useSelector(
    (state) => state.cartState
  );

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        {/* SUBTOTAL */}
        <p className="flex justify-between text-xs border-b border-base-300 pb-2">
          <span>SubTotal</span>
          <span className="font-medium">{formatPrice(cartTotal)}</span>
        </p>

        {/* TAX */}
        <p className="flex justify-between text-xs border-b border-base-300 pb-2">
          <span>Impuesto</span>
          <span className="font-medium">{formatPrice(tax)}</span>
        </p>
        {/* ORDER TOTAL */}
        <p className="flex justify-between text-sm mt-4 pb-2">
          <span>Total del pedido</span>
          <span className="font-medium">{formatPrice(orderTotal)}</span>
        </p>
      </div>
    </div>
  );
};

export default CartTotals;
