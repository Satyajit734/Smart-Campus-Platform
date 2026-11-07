
function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Events", icon: "▦" },
  
    { name: "Posts", icon: "✎" },
   
  ]

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-20 z-30 bg-black/20"
        />
      )}

      <aside
        className={`
          fixed left-0 top-20 z-40
          h-[calc(100vh-80px)]
          w-64
          bg-gradient-to-b from-[#164E63] via-[#087EAD] to-[#159FD0]
          shadow-xl shadow-slate-400/30
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
      
       

     
        <nav className="flex flex-col gap-3 p-3 mt-5">

          {menuItems.map((item, index) => (
            <a
              key={item.name}
              href="#"
              onClick={onClose}
              className={`
                flex items-center gap-4
                px-5 py-4 rounded-md
                font-medium transition-all duration-200
                ${index === 0
                  ? "bg-white text-[#0786AE] shadow-md"
                  : "text-white hover:bg-white/20 hover:pl-7"
                }
              `}
            >
              <span className="text-2xl w-7 text-center">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </a>
          ))}

        </nav>
       
<div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/80">

  <button
    onClick={() => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }}
    className="
      w-full flex items-center gap-4
      px-5 py-4 rounded-lg
      text-white font-bold
      hover:bg-red-500/90
      hover:text-white
      transition-all duration-300
    "
  >
    <span className="text-2xl">[⇥</span>
    <span>Logout</span>
  </button>

</div>
      </aside>
      
    </>
  )
}

export default Sidebar
