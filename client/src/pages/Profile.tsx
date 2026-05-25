import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-6 dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Your Profile</h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-gray-900 font-medium dark:text-gray-100">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-gray-900 font-medium dark:text-gray-100">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium capitalize dark:bg-gray-700 dark:text-gray-300">
              {user.role}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {user.role === 'user' && (
            <Link
              to="/purchases"
              className="block text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
            >
              My Purchases →
            </Link>
          )}
          {user.role === 'author' && (
            <Link
              to="/my-products"
              className="block text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
            >
              My Products →
            </Link>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default Profile;
