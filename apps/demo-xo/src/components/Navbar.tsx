"use server";

export default function Navbar() {
	return (
		<nav className="navbar">
			<div className="container mx-auto px-4">
				<div className="navbar-logo">
					<img
						src="/xo_logo.svg"
						width={24}
						height={24}
						alt="XO"
						className="h-4 md:h-4 w-auto hover:scale-105 transition-transform duration-300"
					/>
					<div className="ml-auto space-x-5">
						<a
							className="hover:underline transition"
							target="_blank"
							href={"https://www.xo.builders/"}
						>
							xo.builder ↗
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}
