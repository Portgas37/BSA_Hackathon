"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMinaWallet } from "@/hooks/use-mina-wallet";
import ZkappWorkerClient from "@/hooks/useZkappWorker";

interface PetitionData {
  petitionId: number;
  title: string;
  supporters: string;
  description: string;
  status: string;
  petitionCount: number;
  isActive: boolean;
}

const INITIAL_PETITIONS: PetitionData[] = [
  {
    petitionId: 1,
    title: "Environmental Protection Act",
    supporters: "0",
    description: "Support legislation for reducing carbon emissions and protecting wildlife.",
    status: "Active",
    petitionCount: 0,
    isActive: true,
  },
  {
    petitionId: 2,
    title: "Digital Privacy Rights",
    supporters: "0",
    description: "Advocate for stronger digital privacy laws and data protection.",
    status: "Active",
    petitionCount: 0,
    isActive: true,
  },
  {
    petitionId: 3,
    title: "Education Reform",
    supporters: "0",
    description: "Promote equal access to quality education and modern learning resources.",
    status: "Active",
    petitionCount: 0,
    isActive: true,
  },
];

export function PetitionList() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [petitions, setPetitions] = useState<PetitionData[]>(INITIAL_PETITIONS);
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const { connected, rawAddress } = useMinaWallet();
  const [zkappWorkerClient, setZkappWorkerClient] = useState<ZkappWorkerClient | null>(null);

  useEffect(() => {
    const client = new ZkappWorkerClient();
    setZkappWorkerClient(client);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start("visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [controls]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const handleSignPetition = async (petitionIndex: number) => {
    if (!connected || !rawAddress) {
      alert("Please connect your Auro wallet first!");
      return;
    }
    if (!zkappWorkerClient) {
      alert("Worker not ready yet.");
      return;
    }

    setIsLoading(true);
    const petition = petitions[petitionIndex];

    try {
      const dataToSend = {
        action: "sign",
        petition: {
          petitionId: petition.petitionId.toString(),
          title: petition.title,
          description: petition.description,
          petitionCount: petition.petitionCount.toString(),
          isActive: petition.isActive.toString(),
        },
        studentPublicKey: rawAddress,
      };

      const result = await zkappWorkerClient.remoteApi.signPetition(
        JSON.stringify(dataToSend),
        rawAddress
      );

      if (result.status === "Petition Signed") {
        setPetitions((prev) =>
          prev.map((p, i) =>
            i === petitionIndex
              ? {
                  ...p,
                  petitionCount: p.petitionCount + 1,
                  supporters: (Number(p.supporters) + 1).toString(),
                }
              : p
          )
        );
        alert("You have successfully signed the petition on-chain!");
      } else {
        alert("Error signing petition: " + result.status);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Transaction failed: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={ref}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-20 w-full"
    >
      <motion.div
        initial="hidden"
        animate={controls}
        variants={variants}
        className="container mx-auto px-4 max-w-6xl"
      >
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light mb-6">Active Petitions</h2>
          <p className="text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-12">
            Join our community in making a difference. Sign petitions anonymously using
            zero-knowledge proofs.
          </p>
        </div>

        {isLoading && (
          <div className="mb-4 text-center text-lg font-medium text-cyan-500">
            Processing vote...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {petitions.map((petition, i) => (
            <motion.div
              key={petition.petitionId}
              custom={i}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
            >
              <h3 className="text-xl font-medium mb-2 text-cyan-500">{petition.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{petition.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {petition.petitionCount} supporters
                </span>
                <button
                  onClick={() => handleSignPetition(i)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLoading
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-cyan-500 text-white hover:bg-cyan-600"
                  }`}
                >
                  Sign Petition
                </button>
              </div>
              <div className="mt-4 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                <span className="text-sm text-gray-500">{petition.status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={32} className="text-cyan-500/50" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
