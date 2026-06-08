import Plyr, { PlyrSource } from "plyr-react";
import "plyr-react/plyr.css";

function VideoSection() {
	const videoSrc = {
		type: "video",
		sources: [
			{
				src: "/video/demo-v2.mp4",
				type: "video/mp4",
			},
		],
	};

	const plyrOptions = {
		controls: [
			"play-large",
			"play",
			"progress",
			"current-time",
			"mute",
			"volume",
			"fullscreen",
			"speed",
		],
	};

	return (
		<div className="video-section space-y-4 flex flex-col items-center justify-center">
			<h1 className="neon-text">Sneak peak</h1>
			<p className="text-gray-400 max-w-2/3 items-center pb-4">
				Watch XO Builders in action—AI agents seamlessly crafting a full-stack
				app in real-time.
			</p>
			<div className="video-container">
				<Plyr source={videoSrc as PlyrSource} options={plyrOptions} />
			</div>
		</div>
	);
}

export default VideoSection;
