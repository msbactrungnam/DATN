export const CreateButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-red-600 text-white rounded-lg w-fit h-fit p-4 flex justify-center items-center hover:bg-red-500 hover:border-white"
    >
      Join meting
    </button>
  );
};
