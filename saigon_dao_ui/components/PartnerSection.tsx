"use client";
import Partner2 from "@/public/Bifrost.svg";
import Partner3 from "@/public/OG.svg";
import Partner1 from "@/public/VBI.svg";
import { motion } from "framer-motion";
import Image from "next/image";

const PartnerSection = () => {
  return (
    <div className="relative overflow-hidden bg-black py-10 h-48">
      <motion.div
        className="flex space-x-16 w-max absolute"
        animate={{ x: "-75%" }}
        transition={{ ease: "linear", duration: 130, repeat: Infinity }}
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-16">
            <Image src={Partner1} alt="Partner 1" width={200} height={100} />
            <Image src={Partner2} alt="Partner 2" width={200} height={100} />
            <Image src={Partner3} alt="Partner 3" width={200} height={100} />
          </div>
        ))}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-16">
            <Image src={Partner1} alt="Partner 1" width={200} height={100} />
            <Image src={Partner2} alt="Partner 2" width={200} height={100} />
            <Image src={Partner3} alt="Partner 3" width={200} height={100} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default PartnerSection;
