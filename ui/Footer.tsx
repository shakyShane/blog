import { A, ALink } from "./Type";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-400 shadow">
      <div className="container max-w-4xl mx-auto flex py-8">
        <div className="w-full mx-auto flex flex-wrap">
          <div className="flex w-full md:w-1/2 ">
            <div className="px-8">
              <h3 className="font-bold text-gray-900">About</h3>
              <p className="pb-4 text-gray-600 text-sm">
                A NextJS blog built with MDX files + interactive sections that hydrate independently via Preact or
                web-components
              </p>
            </div>
          </div>

          <div className="flex w-full md:w-1/2">
            <div className="px-8">
              <h3 className="font-bold text-gray-900">Social</h3>
              <ul className="list-reset items-center text-sm pt-3">
                <li>
                  <ALink href="https://twitter.com/shaneOsbourne">@shaneOsbourne on Twitter</ALink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
