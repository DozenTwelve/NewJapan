export default function ModernButton({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow transition duration-150 border";

  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent",
    gray: "bg-gray-500 text-white hover:bg-gray-600 border-transparent",
    red: "bg-red-600 text-white hover:bg-red-700 border-transparent",
    green: "bg-green-600 text-white hover:bg-green-700 border-transparent",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
