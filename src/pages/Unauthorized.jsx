export default function Unauthorized() {
  const goHome = () => {
    window.location.hash = '#/'
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F0F1A] text-white gap-6 px-6">
      <span className="text-7xl">🚫</span>
      <h1 className="font-title text-3xl font-extrabold">Acceso denegado</h1>
      <p className="text-white/60 text-center max-w-md font-body">
        No tienes permisos suficientes para acceder a esta sección.
      </p>
      <button
        onClick={goHome}
        className="px-6 py-3 bg-[#8B5CF6] text-white font-semibold rounded-[8px] hover:bg-[#7C3AED] transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  )
}
