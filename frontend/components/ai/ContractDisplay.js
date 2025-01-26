// components/ContractDisplay.js
import { motion } from "framer-motion";

export default function ContractDisplay({ loading, contractText }) {
  return (
    <div className="h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Generated Contract</h1>
      {loading ? (
        <p className="text-gray-500">Generating contract...</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow rounded p-4"
        >
          <pre className="whitespace-pre-wrap">{contractText}</pre>
        </motion.div>
      )}
    </div>
  );
}
