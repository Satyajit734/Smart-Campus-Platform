
function Navbar({ onMenuClick }) {
  return (
    <nav className="
      fixed top-0 left-0 z-50
      w-full h-20
      bg-gradient-to-r from-[#164E63] via-[#087EAD] to-[#159FD0]
      shadow-lg shadow-slate-400/30
      flex items-center px-10 gap-6
    ">

      <button
        onClick={onMenuClick}
        className="text-white text-3xl hover:text-cyan-200 transition-colors"
      >
        ☰
      </button>

      <h1 className="text-2xl font-bold text-white">
        Smart Campus
      </h1>

     
      <div className="ml-auto flex items-center gap-4">

        <a
          href="/login"
          className="px-5 py-2 rounded-lg border border-white
          text-white font-semibold hover:bg-white
          hover:text-cyan-500 transition-all"
        >
          Login
        </a>

        <a
          href="/signup"
           className="px-5 py-2 rounded-lg border border-white
          text-white font-semibold hover:bg-white
          hover:text-cyan-500 transition-all"
        >
          Sign Up
        </a>

      </div>

    </nav>
  )
}

export default Navbar
