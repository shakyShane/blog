import { NAME } from "~/ui/constants";

export function Nav() {
    return (
        <nav id="header" className="fixed w-full z-10 top-0 shadow bg-white">
            <div className="w-full md:max-w-4xl mx-auto flex flex-wrap items-center justify-between mt-0 py-3">
                <div className="pl-4">
                    <a
                        className="text-gray-900 text-base no-underline hover:no-underline font-extrabold text-xl"
                        href="/"
                    >
                        {NAME}
                    </a>
                </div>
            </div>
        </nav>
    );
}
