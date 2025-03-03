import { getBooks } from "@/services/backend/actions";
import { api } from "@/services/backend/react-query-wrapper";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    getBooks();
  }, []);

  return <div className="flex flex-col min-h-screen"></div>;
};

export default Home;
