import { ArtworksTable } from './components/ArtworksTable'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Art Institute of Chicago
          </h1>
        </div>

        <ArtworksTable />
      </div>
    </div>
  )
}

export default App
