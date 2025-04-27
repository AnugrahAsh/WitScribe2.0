import { Link } from "react-router-dom";
import shraddhadi from '../assets/websocket.webp'
import quizzy from '../assets/quiz.webp'
import leadery from '../assets/leaderboard.webp'
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
// ..
AOS.init();

export default function LandingPage() {
  return (
    <>
     <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="300">
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-8 bg-gray-100 p-6">

      <nav data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="300" className="flex items-center justify-center gap-8 mt-2">
        <Link className="bg-slate-200 rounded-full px-3 py-1" to='/home'>Home</Link>
        <Link className="bg-slate-200 rounded-full px-3 py-1" to='/about'>About Us</Link>
        <Link className="bg-slate-200 rounded-full px-3 py-1" to='/contact'>Contact Us</Link>
        <Link className="bg-slate-200 rounded-full px-3 py-1" to='/faq'>FAQ</Link>
      </nav>

      {/* Hero Section */}
      <section className="text-center bg-gray-300 py-40 mb-4 rounded-xl shadow">
        <h1 className="text-6xl font-bold mb-4 leading-22">Level Up Your Studies <br /> With WitScribe</h1>
        <p className="text-gray-700 text-xl mb-6">Supercharge Your Studies with Us —<br />Embark on a Transformative Learning Journey Today!</p>
        <Link to = "/register">
        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-10 rounded-full shadow-md">Explore for free &rarr;</button>
      </Link>
      </section>
      </div>

      {/* Video Summarizer Section */}
      <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="400">
      <section className="flex flex-col md:flex-row items-center mx-10 bg-gray-200 p-8 rounded-xl mb-30 shadow">
        <div className="md:w-1/2 mb-6 md:mb-0">
        
          <img src={shraddhadi} alt="How to use WebSocket?" className="rounded-lg shadow" />
          
        </div>
        <div className="md:w-1/2 md:pl-12 text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-4">Is the video too long for you?</h2>
          <p className="text-gray-700 mb-4">
            What if we say you can learn what is in the video faster and much better without even watching the video
            with the help of Artificial Intelligence
          </p>
          <Link to = "/register">
          <button className="bg-black text-white py-2 px-5 rounded-full hover:bg-gray-800"> Enhance Your Studies →</button>
        </Link>
        </div>
      </section>
      </div>
      </div>
      

      {/* Quiz Generation Section */}
      <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="400">
      <section className="py-12 px-4 mb-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Generate live quizzes of the topics you learn</h2>
              <p className="mb-8">
                Yes it's true, you heard it right you just upload the link of the YouTube video click on generate quiz and poof! you have your own quiz generated especially for you
              </p>
            </div>
            <div className="w-100 md:w-1/2 flex gap-4">
              <div className="bg-gray-20 h-32 w-100">
              <img src={quizzy} alt="How to use WebSocket?" className="rounded-lg shadow h-auto" />

              </div>
              <div className="bg-gray-200 h-32 w-full">
              <img src={leadery} alt="How to use WebSocket?" className="rounded-lg shadow" />

              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Community Section */}
      <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="400">
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-8">Explore Our Community Of Students</h3>
          
          <div className="bg-gray-200 p-6 rounded-lg">
            <div className="bg-gray-800 rounded-lg p-4 text-white">
              {/* First comment */}
              <div className="pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                  <div>Sean</div>
                </div>
                <p>Guys can you help me out with this question?</p>
                <div className="mt-2 bg-gray-700 h-16 w-1/3 rounded"></div>
              </div>
              
              {/* Second comment */}
              <div className="py-4 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                  <div>Andrew</div>
                </div>
                <p className="mb-2">Yes Sean, The best way to solve this question is that you can actually add 1 and subtract 1 in numerator and then divide the whole equation in two parts and then solve them independently</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Reply
                  </button>
                  <div className="flex items-center gap-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    3 Likes
                  </div>
                </div>
              </div>
              
              {/* Third comment */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                  <div>Albert</div>
                </div>
                <p className="mb-2">Andrew is right this method is much easier to use than textbook one think of it as a cheat code</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Reply
                  </button>
                  <div className="flex items-center gap-1 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    1 Like
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Reviews Section */}
      <div data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-easing="ease-in-out" data-aos-delay="400">
      <section className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-2/3">
              <h3 className="text-lg font-semibold mb-4">Latest reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Review 1 */}
                <div className="border rounded-lg p-4">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h4 className="font-semibold mb-2">Andrew was here</h4>
                  <p className="text-sm mb-4">I can get notes of any video I want, it also provides time stamps of those videos, its awesome</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Andrew</span>
                    <span className="text-xs text-gray-500">2-4-2025</span>
                  </div>
                </div>
                
                {/* Review 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h4 className="font-semibold mb-2">Best Summarizer</h4>
                  <p className="text-sm mb-4">Provide the best summaries of any topic I want just time to upload the link</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Cristina</span>
                    <span className="text-xs text-gray-500">27-1-2025</span>
                  </div>
                </div>
                
                {/* Review 3 */}
                <div className="border rounded-lg p-4">
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <h4 className="font-semibold mb-2">A Saviour</h4>
                  <p className="text-sm mb-4">no save me at the time just before exams</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Amrita Sharma</span>
                    <span className="text-xs text-gray-500">6-2-2025</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <h2 className="text-4xl font-bold mb-6">What Our Users Say?</h2>
              <p className="mb-6">You will love us too just like our users so try us now</p>
              <Link to = "/register">
              <button className="text-red-500 hover:text-red-600 font-medium flex items-center">
                Try Now 
              
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
    </>
  );
}