import { useState, useRef, useEffect } from "react";
import Icon from "../Icon";
import { Button } from "../ui/button";

function ActionDropdown({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate if dropdown should open upward
  useEffect(() => {
    if (open && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 200; // Approximate max height
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Open upward if not enough space below but enough space above
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside both button and dropdown
      // Don't close if any action is loading
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !loadingActionId
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loadingActionId]);

  const handleActionClick = async (action, actionId) => {
    // If action has loading support (returns a promise)
    if (action.onClick && typeof action.onClick === "function") {
      try {
        setLoadingActionId(actionId);
        const result = action.onClick();

        // If onClick returns a promise, wait for it
        if (result && typeof result.then === "function") {
          await result;
        }

        // Only close if not loading anymore and action doesn't specify keepOpen
        if (!action.keepOpen) {
          setOpen(false);
        }
      } catch (error) {
        console.error("Action error:", error);
      } finally {
        setLoadingActionId(null);
      }
    }
  };

  return (
    <>
      <div ref={buttonRef} className="relative inline-block">
        {/* 3-dot button */}
        <Button
          onClick={() => setOpen((p) => !p)}
          variant="ghost"
          size="icon"
          title={open ? "" : "Actions"}
        >
          <Icon name="more-vertical" size="16px" />
        </Button>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="fixed w-44 z-9999"
          style={{
            ...(openUpward
              ? {
                  bottom: `${window.innerHeight - buttonRef.current?.getBoundingClientRect().top + 4}px`,
                  left: `${buttonRef.current?.getBoundingClientRect().right - 176}px`,
                }
              : {
                  top: `${buttonRef.current?.getBoundingClientRect().bottom + 4}px`,
                  left: `${buttonRef.current?.getBoundingClientRect().right - 176}px`,
                }),
          }}
        >
          {/* Arrow */}
          <div
            className={`pointer-events-none absolute right-3 w-4 h-4 bg-popover border rotate-45 -z-10 ${
              openUpward
                ? "-bottom-2 border-r border-b"
                : "-top-2 border-l border-t"
            }`}
          />

          {/* Dropdown body (content only) */}
          <div className="bg-popover border rounded overflow-hidden">
            {actions.map((action, idx) => {
              const actionId = action.id || idx;
              const isLoading = loadingActionId === actionId;
              const isDisabled =
                action.disabled || (loadingActionId !== null && !isLoading);

              return (
                <div key={actionId}>
                  <Button
                    onClick={() => handleActionClick(action, actionId)}
                    variant="ghost"
                    disabled={isDisabled || isLoading}
                    className={`flex items-center justify-start gap-3 w-full px-4 py-2 transition rounded-none  ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    } ${action.className || ""}`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <Icon name={action.icon} size="16px" />
                    )}
                    <span>{action.label}</span>
                  </Button>
                  {idx < actions.length - 1 && (
                    <div className="border-b border-border/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default ActionDropdown;
