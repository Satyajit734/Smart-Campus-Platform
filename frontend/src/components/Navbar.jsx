function Navbar({ onMenuClick }) {
  return (
    <nav className="
      fixed top-0 left-0 z-50
      w-full h-20
      bg-black/30
      backdrop-blur-xl
      border-b border-[#3B82F6]/30
      shadow-lg shadow-black/30
      flex items-center px-10 gap-6
    ">

      <button
        onClick={onMenuClick}
        className="text-white text-3xl hover:text-cyan-400 transition-colors"
      >
        ☰
      </button>

      <h1 className="text-2xl font-bold text-cyan-400">
        Smart Campus
      </h1>

    </nav>
  )
}

export default Navbar