import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const links = [
  { id: 1, url: "/", text: "Inicio" },
  { id: 2, url: "about", text: "Nosotros" },
  { id: 3, url: "products", text: "Productos" },
  { id: 4, url: "cart", text: "Carrito" },
  { id: 5, url: "checkout", text: "Checkout" },
  { id: 7, url: "crearproducto", text: "Gestion productos" },
];

const NavLinks = () => {
  const user = useSelector((state) => state.userState.user);

  console.log("User in NavLinks:", user);

  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if ((url === "checkout" || url === "orders") && !user) return null;
        if (url === "crearproducto" && (!user || !user.roles.includes("Administrador"))) return null;

        return (
          <li key={id}>
            <NavLink to={url} className="capitalize">
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};

export default NavLinks;
