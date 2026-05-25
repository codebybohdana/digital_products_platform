import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="" className="h-8 rounded-lg" />
            <span className="font-bold text-lg text-gray-900">Folio</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>

            {user ? (
              <>
                {user.role === "author" && (
                  <Link
                    to="/products/add"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Add Product
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
