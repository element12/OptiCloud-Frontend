const About = () => {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-8 py-16">
      
      {/* Título */}
      <div className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          SOMOS <span className="text-primary">OPTICLOUD</span>
        </h1>

        <div className="badge badge-primary badge-outline px-6 py-4 text-lg tracking-widest">
          👓 GAFAS & ESTILO
        </div>
      </div>

      {/* Descripción */}
      <p className="mt-8 text-center max-w-3xl text-lg sm:text-xl leading-8 text-base-content/80">
        En <strong>OPTICLOUD</strong> nos especializamos en ofrecer 
        <span className="text-primary font-semibold"> gafas modernas, cómodas y de alta calidad</span>, 
        combinando estilo, protección visual y tecnología para acompañarte en tu día a día.
      </p>

      {/* Tarjetas */}
      <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl">
        
        <div className="card bg-base-100 shadow-lg p-6 text-center hover:scale-105 transition">
          <h3 className="font-bold text-lg text-primary mb-2">👓 Calidad</h3>
          <p className="text-sm opacity-80">
            Lentes certificados y monturas resistentes.
          </p>
        </div>

        <div className="card bg-base-100 shadow-lg p-6 text-center hover:scale-105 transition">
          <h3 className="font-bold text-lg text-primary mb-2">✨ Estilo</h3>
          <p className="text-sm opacity-80">
            Diseños modernos para cada personalidad.
          </p>
        </div>

        <div className="card bg-base-100 shadow-lg p-6 text-center hover:scale-105 transition">
          <h3 className="font-bold text-lg text-primary mb-2">🚚 Confianza</h3>
          <p className="text-sm opacity-80">
            Atención cercana y envíos seguros.
          </p>
        </div>

      </div>

      {/* Botón */}
      <div className="mt-12">
        <a href="/products" className="btn btn-primary btn-wide">
          Ver catálogo
        </a>
      </div>

    </section>
  );
};

export default About;
