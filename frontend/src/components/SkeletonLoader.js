export default function SkeletonLoader({ type = 'card', count = 1 }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 w-full h-[400px] flex flex-col gap-4">
                        <div className="bg-gray-200 animate-pulse h-56 w-full rounded-2xl"></div>
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="bg-gray-200 animate-pulse h-6 w-3/4 rounded-md"></div>
                            <div className="bg-gray-200 animate-pulse h-4 w-1/2 rounded-md"></div>
                            <div className="bg-gray-200 animate-pulse h-10 w-full rounded-xl mt-4"></div>
                        </div>
                    </div>
                );
            case 'text':
            default:
                return <div className="bg-gray-200 animate-pulse h-6 w-full rounded-md"></div>;
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-full">{renderSkeleton()}</div>
            ))}
        </>
    );
}
