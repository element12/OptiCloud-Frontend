import { Form, useLoaderData, Link } from "react-router-dom";
import FormInput from "./FormInput";
import SelectInput from "./SelectInput";
import FormRange from "./FormRange";
import FormCheckbox from "./FormCheckbox";
import { act } from "react";

const Filters = () => {
  const { meta, params } = useLoaderData();
  const { categoria, nombre, precioMin, precioMax, activo, page} = params;
  return (
    <Form className="bg-base-200 rounded-md px-8 py-4 grid gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center">
      <FormInput
        type="search"
        name="search"
        label="Buscar producto"
        size="input-sm"
        defaultValue={nombre}
      />
      <SelectInput
        label="Seleccionar categoría"
        name="category"
        list={meta.categorias}
        size="select-sm"
        defaultValue={categoria}
      />
      <FormRange
        name="price"
        label="Precio Mínimo"
        size="range-sm"
        price={precioMin}
      />
      <FormRange
        name="price"
        label="Precio máximo"
        size="range-sm"
        price={precioMax}
      />
      <button className="btn btn-primary btn-sm capitalize" type="submit">
        buscar
      </button>
      <Link to="/products" className="btn btn-accent btn-sm capitalize">
        resetear filtros
      </Link>
    </Form>
  );
};

export default Filters;
