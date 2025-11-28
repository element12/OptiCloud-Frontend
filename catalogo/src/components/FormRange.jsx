import { useState, useEffect } from "react";
import { formatPrice } from "../utils";

const FormRange = ({ label, name, size, price, min = 0, max = 25000000 }) => {
  const step = 10000;
  const [selectedPrice, setSelectedPrice] = useState(price ?? max);

  // 🔥 cuando cambia el filtro, actualizar el slider
  useEffect(() => {
    setSelectedPrice(price ?? max);
  }, [price, max]);

  return (
    <div className="form-control">
      <label
        htmlFor={name}
        className="label flex mb-1 justify-between cursor-pointer"
      >
        <span className="label-text capitalize">{label}</span>
        <span>{formatPrice(selectedPrice)}</span>
      </label>

      <input
        type="range"
        className={`range range-primary ${size}`}
        name={name}
        min={min}
        max={max}
        value={selectedPrice}
        onChange={(e) => setSelectedPrice(Number(e.target.value))}
        step={step}
      />

      <div className="w-full flex justify-between text-xs px-2 mt-2">
        <span className="font-bold text-md">
          {formatPrice(min)}
        </span>

        <span className="font-bold text-md">
          Max: {formatPrice(max)}
        </span>
      </div>
    </div>
  );
};

export default FormRange;
