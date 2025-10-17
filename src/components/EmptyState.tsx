export function EmptyState(): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-4 text-6xl">📝</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No tasks yet!
            </h2>
            <p className="text-gray-500 max-w-md">
                Add your first task to get started and stay organized.
            </p>
        </div>
    );
}
