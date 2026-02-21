import { ArtworksTable } from './components/ArtworksTable'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Artwork Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Browse the Art Institute of Chicago collection with persistent selection.
          </p>
        </div>

        <ArtworksTable />
      </div>
    </div>
  )
}

export default App
