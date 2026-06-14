const Loader = ({ fullScreen = false }) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50' 
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClass}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default Loader;