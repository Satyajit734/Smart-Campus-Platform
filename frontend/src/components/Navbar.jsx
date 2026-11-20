
import React from "react";

export default function Navbar({ role, user, onMenu, onNavigate }) {
  return (
    <header className="fixed left-1/2 top-[14px] z-50 flex h-16 w-[calc(100%-28px)] 
    max-w-[1260px] -translate-x-1/2 items-center gap-3 rounded-full 
    border border-white/15 bg-[#102442]/90 px-3 text-white shadow-[0_20px_65px_rgba(0,0,0,0.35)] 
    backdrop-blur-2xl backdrop-saturate-150">

      {/* Left: Menu and Brand */}
      <div className="flex min-w-[235px] items-center gap-2">

        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center gap-0.5 rounded-full border border-white/10
           bg-white/[0.06] text-xl text-slate-300 transition hover:bg-blue-500/20 hover:text-blue-400"
        >
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </button>

        <div className="flex items-center gap-2 max-[780px]:hidden">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-full 
          border border-blue-400/30 bg-gradient-to-br from-blue-400/30 to-indigo-500/20 text-sm font-extrabold 
          text-blue-300 shadow-[inset_0_1px_10px_rgba(96,165,250,0.15)]">
            SC
          </div>

          <div>
            <strong className="block text-sm font-extrabold text-white">
              Smart Campus
            </strong>
            <small className="mt-0.5 block text-[10px] font-semibold text-slate-400">
              {role} workspace
            </small>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-auto flex h-[46px] max-w-[570px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 shadow-inner backdrop-blur-xl transition focus-within:border-blue-400/40 focus-within:bg-white/[0.09]">

        <span className="text-xl text-blue-300">⌕</span>

        <input
          placeholder="Search posts"
          aria-label="Search"
          className="w-full min-w-0 bg-transparent text-[13px] font-semibold text-white outline-none placeholder:text-slate-400"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              onNavigate("Posts");
            }
          }}
        />

        <span className="text-xl text-slate-400">⌁</span>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] p-1 max-[1050px]:hidden">

        {["Posts", "Academic", "Events"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onNavigate(item)}
            className="rounded-full px-3 py-2 text-[11px] font-bold text-slate-300 transition hover:bg-blue-500/15 hover:text-blue-300"
          >
            {item}
          </button>
        ))}

      </nav>

      {/* Profile */}
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-200 max-[780px]:hidden">

        <div className="grid h-[34px] w-[34px] place-items-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 font-extrabold text-blue-200">
          {user?.name?.slice(0, 1).toUpperCase() || role?.slice(0, 1).toUpperCase()}
        </div>

        <span>{user?.name || role}</span>
      </div>

    </header>
  );
}
