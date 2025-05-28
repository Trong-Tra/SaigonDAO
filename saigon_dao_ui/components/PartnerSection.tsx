"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const PartnerSection = () => {
  return (
    <div className="relative overflow-hidden bg-transparent py-16 h-72 mb-8">
      <motion.div
        className="flex space-x-16 w-max absolute"
        animate={{ x: "-75%" }}
        transition={{ ease: "linear", duration: 130, repeat: Infinity }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex space-x-16 items-center">
            <div
              className="bg-slate-800 p-4 rounded-lg flex items-center justify-center"
              style={{ width: 220, height: 120 }}
            >
              <Image
                src="/images/partners/NamiFoundation.png"
                alt="Nami Foundation"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
            <div
              className="bg-white p-4 rounded-lg flex items-center justify-center"
              style={{ width: 180, height: 120 }}
            >
              <Image
                src="/images/partners/SCI.png"
                alt="SCI"
                width={140}
                height={80}
                className="object-contain"
              />
            </div>
            <div
              className="bg-slate-800 p-4 rounded-lg flex items-center justify-center"
              style={{ width: 220, height: 120 }}
            >
              <Image
                src="/images/partners/NamiFoundation.png"
                alt="Nami Foundation"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
            <div
              className="bg-white p-4 rounded-lg flex items-center justify-center"
              style={{ width: 180, height: 120 }}
            >
              <Image
                src="/images/partners/SCI.png"
                alt="SCI"
                width={140}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-transparent"></div>
    </div>
  );
};

export default PartnerSection;
