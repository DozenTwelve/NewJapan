export default function ModernButton({
    children,
    variant = "primary",
    className = "",
    ...props
  }) {
    const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition";
    const styles = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700",
      gray: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      red: "bg-red-500 text-white hover:bg-red-600",
      green: "bg-green-600 text-white hover:bg-green-700",
    };
  
    return (
      <button className={`${base} ${styles[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  