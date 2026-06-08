"use server";

interface SocialLinkProps {
	text: string;
	href: string;
}

const SocialLink = ({ text, href }: SocialLinkProps) => (
	<a
		href={href}
		target="_blank"
		className="text-gray-400 hover:text-white transition-colors"
	>
		{text}
	</a>
);

const Footer = () => {
	return (
		<footer className="border-t border-[#1A1A1A] bg-[#0A0A0A]">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row justify-between items-center gap-8">
					<div>
						<a href="/" title="Smoodle">
							<img src="/xo_logo.svg" alt="XO" width={45} height={45} />
						</a>
					</div>

					<div className="flex gap-6">
						<SocialLink text="X" href="https://x.com/xo_build" />
						<SocialLink text="Telegram" href="https://t.me/+hdMlSlGi6ARkYzAx" />
					</div>
				</div>

				<div className="flex justify-center md:justify-start pt-8 border-t border-[#1A1A1A] mt-8">
					<span className="text-sm text-gray-400">
						© 2025 XO. All rights reserved.
					</span>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
