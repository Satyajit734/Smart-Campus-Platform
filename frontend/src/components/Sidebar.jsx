function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-20 z-30 bg-transparent"
        />
      )}

     
      <aside className={`
        fixed left-0 top-20 z-40
        h-[calc(100vh-80px)]
        w-64
        bg-black/20
        border-r border-white/10
        p-5
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

      

        <nav className="flex flex-col gap-2">

          <a className="bg-cyan-900/50 text-cyan-400 rounded-lg px-4 py-3 cursor-pointer">
            Home
          </a>

          <a className="text-slate-300 hover:bg-white/5 rounded-lg px-4 py-3 cursor-pointer">
            Events
          </a>

        </nav>
      </aside>
    </>
  )
}

export default Sidebar