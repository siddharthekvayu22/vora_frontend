import { useState, useRef, useEffect } from "react";
import Icon from "../Icon";

function ActionDropdown({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* 3-dot button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="px-3 py-2 rounded-full hover:bg-muted transition cursor-pointer outline-0"
        title={open ? "" : "Actions"}
      >
        <Icon name="more-vertical" size="16px" />
      </button>

      {open && (
        <div className="absolute -right-1 w-44 z-50">
          {/* 🔺 Arrow (OUTSIDE body, visible always) */}
          <div className="pointer-events-none absolute -top-2 right-4 w-4 h-4 bg-popover border-l border-t rotate-45 -z-10" />

          {/* Dropdown body (content only) */}
          <div className="bg-popover border rounded-sm shadow-lg overflow-hidden z-40">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-muted transition cursor-pointer ${action.className || ""}`}
                title=""
              >
                <Icon name={action.icon} size="16px" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionDropdown;
