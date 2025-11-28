const FormCheckbox = ({ label, name, size, defaultValue }) => {
  return (
    <div className="form-control items-center">
      <label
        htmlFor={name}
        className="label block text-center mb-1.5 cursor-pointer">
        <span className="label-text capitalize">{label}</span>
      </label>
      <input
        type="checkbox"
        name={name}
        defaultValue={defaultValue}
        value="true"
        className={`checkbox checkbox-primary mx-auto block ${size}`}
      />
    </div>
  );
};

export default FormCheckbox;
