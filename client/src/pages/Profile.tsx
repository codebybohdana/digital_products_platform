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
    <div className="max-w-lg mx-auto">

      {/* Avatar + main info card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-4">

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
              {user.role}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-1">
          {user.role === 'user' && (
            <>
              <Link to="/purchases" className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span className="text-sm font-medium">My Purchases</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
              <Link to="/wishlist" className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span className="text-sm font-medium">My Wishlist</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
              <Link to="/cart" className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M6 2H3v2h1l3.6 7.59L5.25 14a1 1 0 0 0 .9 1.5h12.85v-2H7.42l1.1-2h7.98a1 1 0 0 0 .9-.55l3-6a1 1 0 0 0-.9-1.45H5.21L4.27 2H2"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
                  <span className="text-sm font-medium">My Cart</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </>
          )}
          {user.role === 'author' && (
            <Link to="/my-products" className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span className="text-sm font-medium">My Products</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          )}
        </div>
      </div>

      {/* Log out button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Log out
      </button>

    </div>
  );
}

export default Profile;