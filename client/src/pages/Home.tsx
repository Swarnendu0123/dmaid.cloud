import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import Blog from "../components/Blog";
import { blogs } from "../assets/data";

const Home = () => {
  // extract the id from the URL
  const { id } = useParams();
  // filter the blog object based on the id
  const b = blogs.filter((blog) => blog.id === id)[0];

  return (
    <div>
      <Navigation />
      <Blog blog={b} />
    </div>
  );
};

export default Home;
