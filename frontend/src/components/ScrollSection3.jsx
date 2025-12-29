import { motion } from "framer-motion";

const CheckItem = ({ text }) => (
  <motion.div
    className="flex items-center space-x-4 mb-6"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neonPurple flex items-center justify-center text-white font-bold">
      ✓
    </span>
    <span className="text-xl md:text-2xl text-gray-200">{text}</span>
  </motion.div>
);

const ScrollSection3 = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-spaceBlue to-spaceDark overflow-hidden">
      <div className="container mx-auto px-6 md:flex md:items-center">
        <div className="md:w-1/2 mb-10 md:mb-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="text-9xl md:text-[12rem] absolute -top-20 -left-20 opacity-10 select-none animate-spin-slow"
          >
            ⚙️
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Why <span className="text-neonPurple">Mission Control X?</span>
          </h2>
          <div className="space-y-2">
            <CheckItem text="Educational + Fun Gameplay" />
            <CheckItem text="Beginner & Pro Flight Modes" />
            <CheckItem text="Real ISRO Mission Logic" />
            <CheckItem text="Community-Created Levels" />
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center relative z-10">
          {/* Abstract representation of community/levels */}
          <motion.div
            className="w-full max-w-md aspect-square bg-gradient-to-tr from-neonBlue to-neonPurple rounded-3xl opacity-80 backdrop-blur-xl p-1"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full h-full bg-spaceDark rounded-3xl flex items-center justify-center border border-white/20">
              <span className="text-8xl animate-bounce">👨‍🚀</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ScrollSection3;
