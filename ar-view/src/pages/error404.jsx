
import { FaQuestionCircle, FaForumbee, FaTelegramPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom'
const Error404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Dinosaur and Person Running Illustration */} 
      <img src="https://media.giphy.com/media/6b2E6Pa7yZZba/giphy.gif?cid=790b7611y6d03hsdbfks76qwrqlj1g8rnnzd4pzvchg4rhyr&ep=v1_gifs_search&rid=giphy.gif&ct=s"/>
       
      <div className="relative flex justify-center items-center mb-10">
  
  <div className="text-orange-500 text-9xl transition-transform transform hover:translate-x-10 hover:rotate-6 duration-500 ease-in-out cursor-pointer">
    🏃‍♂️
  </div>

  <div className="ml-4 text-green-500 text-9xl transition-transform transform hover:translate-x-[-50px] hover:translate-y-[-20px] duration-500 ease-in-out cursor-pointer">
    🦖
  </div>
</div>


      {/* Oops Message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
      <p className="text-lg text-gray-600 mb-6">
        Don't worry, our team is here to help
      </p>

      {/* Support Options */}
      <div className="flex space-x-4 mb-8">
        <div className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition">
          <FaQuestionCircle size={30} />
          <span>Questions and Answers</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition">
          <FaForumbee size={30} />
          <span>Community Forum</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition">
          <FaTelegramPlane size={30} />
          <span>Send Support Request</span>
        </div>
      </div>

      {/* Live Support Button */}
      <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition">
      <Link to='/' >  GO TO Home</Link>
      </button>
    </div>
  );
};

export default Error404;
