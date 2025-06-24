import React, { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";
import { FaRocket } from "react-icons/fa";

function LoginPageFallback() {
  return (
    <div className="auth-container">
      <div className="flex justify-center items-center h-screen">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">Loading Login Portal...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
