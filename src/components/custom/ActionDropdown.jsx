import { useState, useRef, useEffect } from "react";
import Icon from "../Icon";

function ActionDropdown({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside both button and dropdown
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={buttonRef} className="relative inline-block">
        {/* 3-dot button */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="px-3 py-2 rounded-full hover:bg-muted transition cursor-pointer outline-0"
          title={open ? "" : "Actions"}
        >
          <Icon name="more-vertical" size="16px" />
        </button>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed w-44 z-[9999]"
          style={{
            top: `${buttonRef.current?.getBoundingClientRect().bottom + 4}px`,
            left: `${buttonRef.current?.getBoundingClientRect().right - 176}px`,
          }}
        >
          {/* 🔺 Arrow (OUTSIDE body, visible always) */}
          <div className="pointer-events-none absolute -top-2 right-3 w-4 h-4 bg-popover border-l border-t rotate-45 -z-10" />

          {/* Dropdown body (content only) */}
          <div className="bg-popover border rounded-sm shadow-lg overflow-hidden">
            {actions.map((action, idx) => (
              <div key={idx}>
                <button
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
                {idx < actions.length - 1 && (
                  <div className="border-b border-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ActionDropdown;
