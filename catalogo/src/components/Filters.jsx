import { Form, useLoaderData, Link } from "react-router-dom";
import FormInput from "./FormInput";
import SelectInput from "./SelectInput";
import FormRange from "./FormRange";
import FormCheckbox from "./FormCheckbox";

const Filters = () => {
  const { meta, params } = useLoaderData();
  const { categoria, nombre, precioMin, precioMax, activo, page } = params;

  return (
    <Form className="bg-base-200 rounded-md px-8 py-4 grid gap-x-4 gap-y-8 
      sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center"
    >
      {/* Buscar por nombre */}
      <FormInput
        type="search"
        name="nombre"
        label="Buscar producto"
        size="input-sm"
        defaultValue={nombre}
      />

      {/* Categorías */}
      <SelectInput
        label="Seleccionar categoría"
        name="categoria"
        list={meta.categorias}
        size="select-sm"
        defaultValue={categoria}
      />

      <FormRange
        name="precioMin"
        label="Precio mínimo"
        size="range-sm"
        min={0}
        max={1000000}
        price={Number(precioMin) || 0}
      />

      <FormRange
        name="precioMax"
        label="Precio máximo"
        size="range-sm"
        min={0}
        max={1000000}
        price={Number(precioMax) || 1000000}
      />


      {/* Solo activos ✅ agregado */}
      <FormCheckbox
        name="activo"
        label="Solo productos activos"
        defaultChecked={activo === "true"}
      />

      {/* Mantener la página */}
      <input type="hidden" name="page" value={page || 1} />

      <button className="btn btn-primary btn-sm capitalize" type="submit">
        Buscar
      </button>

      <Link to="/products" className="btn btn-accent btn-sm capitalize">
        Resetear filtros
      </Link>
    </Form>
  );
};

export default Filters;
