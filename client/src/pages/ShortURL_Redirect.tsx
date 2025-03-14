// import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation";


const Redirect = () => {
  // const { id } = useParams();
  // const b = blogs.filter((blog) => blog.short_id === id)[0];
  // const redirect_id = b.id;
  // console.log(redirect_id);

  return (
    <div>
      <Navigation />
      <h1>Redirecting...</h1>
      {/* <Navigate to={`/blog/${redirect_id}`} />; */}
    </div>
  );
};

export default Redirect;
