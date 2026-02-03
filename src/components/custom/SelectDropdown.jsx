import { useState, useRef, useEffect } from "react";
import Icon from "../Icon";

/**
 * Custom SelectDropdown Component
 * A modern, accessible dropdown select component with custom styling
 */
export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  className = "",
  disabled = false,
  size = "md", // sm, md, lg
  variant = "default", // default, outline, ghost
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Size variants
  const sizeClasses = {
    sm: "px-2 py-1 text-xs min-w-[80px]",
    md: "px-3 py-1.5 text-sm min-w-[100px]",
    lg: "px-4 py-2 text-base min-w-[120px]",
  };

  // Variant styles
  const variantClasses = {
    default: "border border-border bg-background hover:bg-accent/50",
    outline:
      "border-2 border-primary/20 bg-transparent hover:border-primary/40",
    ghost: "border-0 bg-accent/50 hover:bg-accent",
  };

  // Get display text for selected value
  const getDisplayText = () => {
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;
      case "Tab":
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset focused index when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20
          flex items-center justify-between w-full cursor-pointer
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isOpen ? "ring-2 ring-primary/20" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select ${placeholder}`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {getDisplayText()}
        </span>
        <Icon
          name="chevron-down"
          size="14px"
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 text-left text-sm transition-colors duration-150
                  hover:bg-accent focus:bg-accent focus:outline-none
                  ${value === option.value ? "bg-primary/10 text-primary font-medium" : "text-foreground"}
                  ${focusedIndex === index ? "bg-accent" : ""}
                `}
                role="option"
                aria-selected={value === option.value}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Icon name="check" size="14px" className="text-primary" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
