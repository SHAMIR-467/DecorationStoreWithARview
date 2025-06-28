import { Link } from "react-router-dom"; // Import for routing

const Card = () => {
  return (
    <div className="bg-green-100 py-10 px-4 h-30 md:px-16 lg:px-32 rounded-lg shadow-lg">
      {/* Container for text and links */}
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Snack Your Creativity
        </h1>

        {/* Links */}
        <div className="flex space-x-8 text-gray-600 text-sm md:text-base">
          <Link
            to="/"
            className="hover:text-gray-800 hover:underline hover:bg-blue-50 p-2 rounded-lg transition duration-300"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
