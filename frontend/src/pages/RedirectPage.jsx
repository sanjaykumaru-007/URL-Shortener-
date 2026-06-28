import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");
    const redirectUrl = `${baseUrl}/r/${code}`;
    
    // Let the backend handle the redirect
    window.location.href = redirectUrl;
  }, [code, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Redirecting...</h2>
    </div>
  );
};

export default RedirectPage;