import { FormInput, SubmitBtn } from "../components";
import { Link, Form, redirect, useNavigate } from "react-router-dom";
import { customFetch } from "../utils";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/user/userSlice";
import { toast } from "react-toastify";

export const action =
  (store) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
      const response = await customFetch.post("/login", data);
      console.log(response);
      store.dispatch(loginUser(response.data));
      toast.success("Ingresaste correctamente");
      return redirect("/");
      // return null
    } catch (e) {
      const errorMessage =
        e?.response?.data?.error?.message ||
        "Por favor verifica tus credenciales e intenta de nuevo";
      toast.error(errorMessage);
      console.error(errorMessage);
      return null;
    }
  };

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginAsGuestUser = async () => {
    try {
      const response = await customFetch.post("/auth/local", {
        identifier: "test@test.com",
        password: "secret",
      });
      dispatch(loginUser(response.data));
      toast.success("welcome guest user");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Error al iniciar sesión como usuario invitado, por favor intenta de nuevo");
    }
  };

  return (
    <section className="grid min-h-screen place-items-center">
      <Form
        method="POST"
        className="card w-75 sm:w-96 p-8 bg-base-100 shadow-lg flex flex-col gap-y-4">
        <h4 className="text-center text-3xl font-bold">Ingresar</h4>
        <FormInput type="email" label="Correo electrónico" name="email" />
        <FormInput type="password" label="Contraseña" name="password" />
        <div className="mt-4">
          <SubmitBtn text="Ingresar" />
        </div>
        <p className="text-center">
          ¿Aún no tienes una cuenta?{" "}
          <Link
            to="/register"
            className="ml-2 link link-hover link-primary capitalize">
            registrarse
          </Link>
        </p>
      </Form>
    </section>
  );
};

export default Login;
