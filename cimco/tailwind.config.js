/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ["*.html", "./src/**/*.rs"],
  },
  safelist: [
    "text-cyan-400", "text-fuchsia-400", "text-green-400", "text-purple-500", "text-emerald-500", "text-red-500", "text-red-400", "text-red-300",
    "text-yellow-300", "text-yellow-400", "bg-red-600", "bg-yellow-500", "bg-emerald-500", "bg-red-500", "bg-yellow-500",
    "bg-red-900", "bg-slate-800", "bg-slate-900", "border-red-500", "border-yellow-500", "border-emerald-500",
    "text-blue-300", "text-purple-300", "text-emerald-300"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
