import React from "react";

const useAuth = () => {
  // very simple token provider
  const getToken = React.useCallback(async () => {
    return sessionStorage.getItem("accessToken");
  }, []);

  return { getToken };
};

export default useAuth;
