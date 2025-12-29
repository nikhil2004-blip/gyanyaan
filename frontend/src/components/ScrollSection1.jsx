import { motion } from "framer-motion";

const ScrollSection1 = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen py-20 bg-spaceBlue overflow-hidden flex items-center justify-center"
    >
      {/* Background Parallax Elements could go here */}

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-8">
            From Earth to Mars...
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: false }}
        >
          <p className="text-xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the thrill of space exploration. <br />
            Simulate <span className="text-neonBlue font-semibold">real ISRO missions</span> with
            physical accuracy.
          </p>
        </motion.div>

        {/* Decorative Planet or Element */}
        <motion.div
          className="absolute top-1/2 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"
          style={{ zIndex: -1 }}
        />
      </div>
    </section>
  );
};

export default ScrollSection1;
