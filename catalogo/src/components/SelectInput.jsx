const SelectInput = ({ label, name, list, defaultValue, size }) => {
  return (
    <div className="form-control">
      <label htmlFor={name} className="label">
        <span className="label-text capitalize mb-1">{label}</span>
      </label>
      <select
        name={name}
        className={`select select-bordered ${size}`}
        defaultValue={defaultValue}
        id={name}>
        {list.map((item) => {
          return (
            <option key={item} value={item} className="">
              {item}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectInput;
