const About = () => {
  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-x-6 items-center justify-center">
        <h1 className="text-4xl font-bold leading-one tracking-tight sm:text-6xl">
          SOMOS OPTICLOUD
        </h1>
        <div className="stats bg-primary shadow">
          <div className="stat">
            <div className="stat-title text-primary-content text-4xl font-bold tracking-widest">
              OPTICLOD
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-lg mx-auto max-w-2xl leading-8">
        Esto es OPTICLOUD
      </p>
    </>
  );
};

export default About;
