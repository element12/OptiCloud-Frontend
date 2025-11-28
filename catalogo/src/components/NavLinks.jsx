import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

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

  const token = localStorage.getItem("token");

  let userRoles = [];

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRoles = decoded.roles || [];
    } catch (error) {
      console.error("Token inválido:", error);
    }
  }

  const hasRole = (role) => userRoles.includes(role);
  const hasAnyRole = (roles) => roles.some(r => userRoles.includes(r));


  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        if ((url === "checkout" || url === "orders") && !user) return null;
        if ((url === "crearproducto") && !hasAnyRole(["Vendedor", "Administrador"])) return null;
        
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
