import { formatPrice, generateAmountOptions } from "../utils";
import { useDispatch } from "react-redux";
import { removeItem, editItem } from "../features/cart/cartSlice";

const CartItem = ({ cartItem }) => {
  const dispatch = useDispatch();

  const removeItemFromTheCart = () => {
    dispatch(removeItem({ cartID }));
  };

  const handleAmountInTheCart = (e) => {
    dispatch(editItem({ cartID, amount: parseInt(e.target.value) }));
  };

  const { cartID, amount, title, price, image, company, productColor } =
    cartItem;

  return (
    <article
      key={cartID}
      className="mb-12 flex flex-col gap-y-4 sm:flex-row flex-wrap border-b border-base-300 pb-6 last:border-b-0">
      {/* IMAGE */}
      <img
        src={image}
        alt={title}
        className="h-24 w-24 rounded-lg sm:h-32 sm:w-32 object-cover"
      />
      {/* INFO */}
      <div className="sm:ml-16 sm:w-48">
        {/* title */}
        <h3 className="capitalize font-medium">{title}</h3>
        {/* company */}
        <h4 className="mt-4 capitalize text-sm text-neutral-content">
          {company}
        </h4>
        {/* color */}
        <p className="mt-2 text-sm capitalize flex items-center gap-x-2">
          color:
          <span
            className="badge badge-sm"
            style={{ background: productColor }}></span>
        </p>
      </div>
      <div className="sm:ml-12">
        {/* AMOUNT */}
        <div className="form-control max-w-xs">
          <label htmlFor="amount" className="label p-0">
            <span className="label-text">Cantidad</span>
          </label>
          <select
            name="amount"
            id="amount"
            className="select select-bordered select-xs select-base mt-2"
            value={amount}
            onChange={handleAmountInTheCart}>
            {generateAmountOptions(amount + 5)}
          </select>
        </div>
        {/* REMOVE */}
        <button
          className="link link-hover link-primary text-sm mt-2"
          onClick={removeItemFromTheCart}>
          remove
        </button>
      </div>
      {/* PRICE */}
      <p className="font-medium sm:ml-auto">{formatPrice(price)}</p>
    </article>
  );
};

export default CartItem;
