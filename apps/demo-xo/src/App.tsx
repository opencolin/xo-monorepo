"use server";

import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import VideoSection from "./components/VideoSection";

function App() {
	return (
		<div className="min-h-screen bg-black text-white">
			<Navbar />
			<div className="container">
				<VideoSection />
			</div>
			<Footer />
		</div>
	);
}

export default App;
